/**
 * @module services/geminiService
 * @description Integrates Gemini API with function calling to create, update, delete, and list events.
 */

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { useEventsStore } from '@/stores/eventsStore';
import { generateId } from '@/lib/utils';
import type { EventData, RecurrenceCycle } from '@/types';

// Declaring the event helper functions to interface with the Zustand store.
const getEventsList = (): EventData[] => {
  return useEventsStore.getState().events;
};

const createCalendarEvent = async (event: EventData) => {
  await useEventsStore.getState().addEvent(event);
};

const deleteCalendarEvent = async (id: string) => {
  await useEventsStore.getState().deleteEvent(id);
};

const updateCalendarEvent = async (event: EventData) => {
  await useEventsStore.getState().updateEvent(event);
};

// Define Gemini tool declarations.
const getEventsDeclaration = {
  name: 'getEvents',
  description:
    'Retrieve all calendar events. Use this to find existing events before deleting or modifying them, or to inspect current events.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
};

const createEventDeclaration = {
  name: 'createEvent',
  description: 'Create a new calendar event.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description: 'The title/name of the event (e.g., "Sinh Nhật Mẹ")',
      },
      start: {
        type: SchemaType.STRING,
        description:
          'The start date and optional time in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss). For yearly events, use the current or upcoming year (e.g. 2026-10-23).',
      },
      end: {
        type: SchemaType.STRING,
        description:
          'The end date and optional time in ISO 8601 format (optional).',
      },
      allDay: {
        type: SchemaType.BOOLEAN,
        description:
          'Whether the event spans the entire day (true if no specific time is provided).',
      },
      category: {
        type: SchemaType.STRING,
        description:
          'The category of the event. Must be one of: appointment, personal, family, work. (default is appointment).',
      },
      location: {
        type: SchemaType.STRING,
        description: 'The location/venue of the event (optional).',
      },
      notes: {
        type: SchemaType.STRING,
        description: 'Additional notes or details about the event (optional).',
      },
      isImportant: {
        type: SchemaType.BOOLEAN,
        description: 'Whether this is an important event.',
      },
      isRecurring: {
        type: SchemaType.BOOLEAN,
        description: 'Whether this event repeats (e.g. annually, monthly).',
      },
      recurrenceCycle: {
        type: SchemaType.STRING,
        description:
          'The recurrence frequency. Must be one of: NONE, MONTHLY, QUARTERLY, YEARLY, BIENNIAL, CUSTOM.',
      },
    },
    required: ['title', 'start'],
  },
};

const deleteEventDeclaration = {
  name: 'deleteEvent',
  description: 'Delete a calendar event by its unique database ID.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      id: {
        type: SchemaType.STRING,
        description: 'The unique ID of the event to delete.',
      },
    },
    required: ['id'],
  },
};

const updateEventDeclaration = {
  name: 'updateEvent',
  description: 'Update/modify an existing calendar event.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      id: {
        type: SchemaType.STRING,
        description: 'The unique ID of the event to update.',
      },
      title: {
        type: SchemaType.STRING,
        description: 'The new title of the event.',
      },
      start: {
        type: SchemaType.STRING,
        description: 'The new start date/time (ISO 8601).',
      },
      end: {
        type: SchemaType.STRING,
        description: 'The new end date/time (ISO 8601).',
      },
      allDay: {
        type: SchemaType.BOOLEAN,
        description: 'Whether the event is all day.',
      },
      category: {
        type: SchemaType.STRING,
        description:
          'The category of the event: appointment, personal, family, work.',
      },
      location: {
        type: SchemaType.STRING,
        description: 'The new location.',
      },
      notes: {
        type: SchemaType.STRING,
        description: 'The new notes.',
      },
      isImportant: {
        type: SchemaType.BOOLEAN,
        description: 'Whether the event is important.',
      },
      isRecurring: {
        type: SchemaType.BOOLEAN,
        description: 'Whether the event is recurring.',
      },
      recurrenceCycle: {
        type: SchemaType.STRING,
        description:
          'The new recurrence cycle (NONE, MONTHLY, QUARTERLY, YEARLY, BIENNIAL, CUSTOM).',
      },
    },
    required: ['id'],
  },
};

export interface StepLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'call';
  message: string;
}

interface ProcessAiPromptParams {
  prompt: string;
  apiKey: string;
  onStep: (log: StepLog) => void;
}

/**
 * Sends a natural language prompt to Gemini and processes database modifications using tools.
 *
 * @param params - Configuration parameters: prompt, apiKey, and a step logger callback.
 * @returns Final textual confirmation from the model.
 */
export async function processAiPrompt({
  prompt,
  apiKey,
  onStep,
}: ProcessAiPromptParams): Promise<string> {
  const addLog = (type: StepLog['type'], message: string) => {
    onStep({
      id: generateId(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    });
  };

  addLog('info', 'Khởi tạo kết nối với Gemini...');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const todayStr = new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const currentIsoStr = new Date().toISOString();

    const systemInstruction = `Bạn là trợ lý lịch thông minh của ứng dụng Useful Tools.
Nhiệm vụ của bạn là hỗ trợ quản lý lịch sự kiện (tìm kiếm, tạo mới, chỉnh sửa, xóa sự kiện).
Hôm nay là: ${todayStr} (ISO timestamp: ${currentIsoStr}). Hãy sử dụng mốc thời gian này để tính toán các từ chỉ thời gian tương đối như "ngày mai", "hôm qua", "tuần sau", v.v.

Hướng dẫn sử dụng Tools:
- Để tạo sự kiện mới, hãy gọi tool 'createEvent'. Nếu người dùng nhập "Sinh nhật Mẹ vào ngày 23/10 hằng năm", hãy set 'isRecurring' = true, và 'recurrenceCycle' = 'YEARLY'.
- Để xóa một hoặc nhiều sự kiện, bạn BẮT BUỘC phải gọi 'getEvents' trước để xem danh sách sự kiện hiện tại, duyệt qua để tìm các sự kiện khớp với mô tả của người dùng (so sánh tiêu đề, nội dung hoặc ngày tháng), lấy 'id' của chúng, và gọi 'deleteEvent' tương ứng cho từng ID đó.
- Để cập nhật sự kiện, bạn cũng BẮT BUỘC gọi 'getEvents' trước để tìm đúng sự kiện và có được 'id' của nó, sau đó gọi 'updateEvent' với ID đó và các thông tin cần sửa đổi.

Hãy trả lời bằng tiếng Việt một cách tự nhiên, lịch sự, thân thiện và tóm tắt ngắn gọn các hành động bạn đã thực hiện.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction,
      tools: [
        {
          functionDeclarations: [
            getEventsDeclaration,
            createEventDeclaration,
            deleteEventDeclaration,
            updateEventDeclaration,
          ],
        },
      ],
    });

    addLog('info', 'Bắt đầu gửi yêu cầu đến AI...');
    const chat = model.startChat();
    let result = await chat.sendMessage(prompt);

    let functionCalls = result.response.functionCalls();

    // Process function calls sequentially
    while (functionCalls && functionCalls.length > 0) {
      const functionResponses = [];

      for (const call of functionCalls) {
        const { name, args } = call;
        addLog('call', `AI yêu cầu gọi công cụ: ${name}`);

        let functionResult: any;

        try {
          if (name === 'getEvents') {
            addLog('info', 'Đang đọc danh sách sự kiện từ lịch...');
            const events = getEventsList();
            functionResult = events.map((e) => ({
              id: e.id,
              title: e.title,
              start: e.start,
              end: e.end,
              allDay: e.allDay,
              categories: e.categories,
              location: e.location,
              notes: e.notes,
              isImportant: e.isImportant,
              isRecurring: e.isRecurring,
              recurringPattern: e.recurringPattern,
            }));
            addLog('success', `Đã tìm thấy ${events.length} sự kiện.`);
          } else if (name === 'createEvent') {
            const rawArgs = args as any;
            addLog('info', `Đang tạo sự kiện mới: "${rawArgs.title}"...`);

            const category = rawArgs.category || 'appointment';
            const isRecurring = !!rawArgs.isRecurring;
            const cycle = (rawArgs.recurrenceCycle ||
              'NONE') as RecurrenceCycle;

            const eventData: EventData = {
              id: generateId(),
              title: rawArgs.title,
              start: rawArgs.start,
              end: rawArgs.end || undefined,
              allDay:
                rawArgs.allDay !== undefined
                  ? !!rawArgs.allDay
                  : !rawArgs.start.includes('T'),
              categories: [category],
              location: rawArgs.location || '',
              notes: rawArgs.notes || '',
              isImportant: !!rawArgs.isImportant,
              isRecurring,
              recurringPattern: isRecurring ? { cycle } : undefined,
              createdAt: new Date().toISOString(),
            };

            await createCalendarEvent(eventData);
            functionResult = {
              success: true,
              message: `Sự kiện "${rawArgs.title}" đã được tạo thành công.`,
            };
            addLog('success', `Đã tạo sự kiện "${rawArgs.title}".`);
          } else if (name === 'deleteEvent') {
            const rawArgs = args as any;
            addLog('info', `Đang xóa sự kiện (ID: ${rawArgs.id})...`);
            await deleteCalendarEvent(rawArgs.id);
            functionResult = {
              success: true,
              message: `Sự kiện có ID "${rawArgs.id}" đã được xóa.`,
            };
            addLog('success', `Đã xóa thành công sự kiện.`);
          } else if (name === 'updateEvent') {
            const rawArgs = args as any;
            addLog('info', `Đang cập nhật sự kiện (ID: ${rawArgs.id})...`);

            const existingEvents = getEventsList();
            const currentEvent = existingEvents.find(
              (e) => e.id === rawArgs.id
            );

            if (!currentEvent) {
              functionResult = {
                success: false,
                error: 'Không tìm thấy sự kiện cần cập nhật.',
              };
              addLog('error', `Không tìm thấy sự kiện có ID "${rawArgs.id}".`);
            } else {
              const updatedEvent: EventData = {
                ...currentEvent,
                title:
                  rawArgs.title !== undefined
                    ? rawArgs.title
                    : currentEvent.title,
                start:
                  rawArgs.start !== undefined
                    ? rawArgs.start
                    : currentEvent.start,
                end: rawArgs.end !== undefined ? rawArgs.end : currentEvent.end,
                allDay:
                  rawArgs.allDay !== undefined
                    ? !!rawArgs.allDay
                    : currentEvent.allDay,
                categories: rawArgs.category
                  ? [rawArgs.category]
                  : currentEvent.categories,
                location:
                  rawArgs.location !== undefined
                    ? rawArgs.location
                    : currentEvent.location,
                notes:
                  rawArgs.notes !== undefined
                    ? rawArgs.notes
                    : currentEvent.notes,
                isImportant:
                  rawArgs.isImportant !== undefined
                    ? !!rawArgs.isImportant
                    : currentEvent.isImportant,
                isRecurring:
                  rawArgs.isRecurring !== undefined
                    ? !!rawArgs.isRecurring
                    : currentEvent.isRecurring,
                recurringPattern: rawArgs.isRecurring
                  ? {
                      cycle: (rawArgs.recurrenceCycle ||
                        currentEvent.recurringPattern?.cycle ||
                        'NONE') as RecurrenceCycle,
                    }
                  : undefined,
              };

              await updateCalendarEvent(updatedEvent);
              functionResult = {
                success: true,
                message: `Sự kiện "${updatedEvent.title}" đã được cập nhật.`,
              };
              addLog('success', `Đã cập nhật sự kiện "${updatedEvent.title}".`);
            }
          }
        } catch (error) {
          const errMsg =
            (error as Error).message || 'Có lỗi xảy ra khi gọi tool.';
          functionResult = { success: false, error: errMsg };
          addLog('error', `Lỗi khi chạy công cụ ${name}: ${errMsg}`);
        }

        functionResponses.push({
          functionResponse: {
            name,
            response: { result: functionResult },
          },
        });
      }

      addLog('info', 'AI đang xử lý kết quả trả về từ công cụ...');
      result = await chat.sendMessage(functionResponses);
      functionCalls = result.response.functionCalls();
    }

    const finalReply = result.response.text();
    addLog('success', 'Hoàn thành yêu cầu!');
    return finalReply;
  } catch (error) {
    const errMsg =
      (error as Error).message || 'Có lỗi xảy ra trong quá trình xử lý.';
    addLog('error', `Lỗi hệ thống: ${errMsg}`);
    throw error;
  }
}
