/**
 * @module services/adminGeminiService
 * @description Integrates Gemini API with Realtime Database tools to perform administrative actions.
 */

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { ref as dbRef, get, set, update, remove } from 'firebase/database';
import { database } from '@/config/firebase';
import { generateId } from '@/lib/utils';

export interface StepLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'call';
  message: string;
}

export interface ChatHistoryMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ProcessAdminAiPromptParams {
  prompt: string;
  apiKey: string;
  history: ChatHistoryMessage[];
  onStep: (log: StepLog) => void;
}

// Admin Database tools declaration
const readDatabaseDeclaration: any = {
  name: 'readDatabase',
  description:
    'Read data from a specific Firebase Realtime Database path. Highly recommended to read a path to inspect its structure/content before editing or deleting it.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      path: {
        type: SchemaType.STRING,
        description:
          'The logical path in the database to read (e.g., "users", "users/some-uid/notes", "mealCheckIns", "periodShareTokens").',
      },
    },
    required: ['path'],
  },
};

const writeDatabaseDeclaration: any = {
  name: 'writeDatabase',
  description:
    'Overwrites data at a specific Firebase Realtime Database path. Be extremely careful as this completely replaces existing data at the path.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      path: {
        type: SchemaType.STRING,
        description: 'The database path to write to.',
      },
      dataJson: {
        type: SchemaType.STRING,
        description: 'A JSON-serialized string representing the data to write.',
      },
    },
    required: ['path', 'dataJson'],
  },
};

const updateDatabaseDeclaration: any = {
  name: 'updateDatabase',
  description:
    'Updates (merges) properties at a specific Firebase Realtime Database path without overwriting other existing sibling fields.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      path: {
        type: SchemaType.STRING,
        description: 'The database path to update.',
      },
      dataJson: {
        type: SchemaType.STRING,
        description:
          'A JSON-serialized string containing the key-value pairs to update.',
      },
    },
    required: ['path', 'dataJson'],
  },
};

const deleteDatabaseDeclaration: any = {
  name: 'deleteDatabase',
  description:
    'Deletes data at a specific Firebase Realtime Database path. Cannot be undone.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      path: {
        type: SchemaType.STRING,
        description: 'The database path to delete.',
      },
    },
    required: ['path'],
  },
};

/**
 * Sends a natural language prompt to Gemini, allowing it to converse and execute database administrative actions.
 */
export async function processAdminAiPrompt({
  prompt,
  apiKey,
  history,
  onStep,
}: ProcessAdminAiPromptParams): Promise<string> {
  const addLog = (type: StepLog['type'], message: string) => {
    onStep({
      id: generateId(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    });
  };

  addLog('info', 'Khởi tạo trợ lý quản trị Gemini...');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const todayStr = new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const currentIsoStr = new Date().toISOString();

    const systemInstruction = `Bạn là Trợ lý AI Quản trị viên (Admin AI Assistant) của ứng dụng Useful Tools.
Bạn có quyền truy cập trực tiếp vào Firebase Realtime Database thông qua các công cụ đọc, ghi, cập nhật và xóa.
Hôm nay là: ${todayStr} (ISO timestamp: ${currentIsoStr}).

Nhiệm vụ của bạn là hỗ trợ quản trị viên quản lý ứng dụng, tra cứu thông tin cơ sở dữ liệu, hỗ trợ sửa lỗi cấu hình, và thay đổi dữ liệu theo yêu cầu.

Hướng dẫn sử dụng công cụ:
1. Đọc dữ liệu ('readDatabase'): Sử dụng để đọc dữ liệu tại bất kỳ đường dẫn nào (ví dụ: 'users', 'users/{uid}/notes', 'mealCheckIns'). Nên đọc dữ liệu trước khi sửa đổi hoặc xóa để xác định thông tin chính xác.
2. Ghi dữ liệu ('writeDatabase'): Sử dụng để ghi đè (set) dữ liệu tại một đường dẫn chỉ định. Nhận dữ liệu dưới dạng chuỗi JSON.
3. Cập nhật dữ liệu ('updateDatabase'): Sử dụng để cập nhật (merge) một số thuộc tính mà không ghi đè toàn bộ dữ liệu. Nhận dữ liệu dưới dạng chuỗi JSON.
4. Xóa dữ liệu ('deleteDatabase'): Sử dụng để xóa dữ liệu tại một đường dẫn chỉ định.

Hãy trả lời bằng tiếng Việt thân thiện, lịch sự nhưng ngắn gọn và rõ ràng. Hãy tóm tắt những thao tác bạn đã thực hiện trên cơ sở dữ liệu để quản trị viên nắm rõ.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction,
      tools: [
        {
          functionDeclarations: [
            readDatabaseDeclaration,
            writeDatabaseDeclaration,
            updateDatabaseDeclaration,
            deleteDatabaseDeclaration,
          ],
        },
      ],
    });

    addLog('info', 'Bắt đầu kết nối hội thoại với AI...');

    // Gemini startChat history must start with a 'user' message
    const firstUserIndex = history.findIndex((msg) => msg.role === 'user');
    const validHistory =
      firstUserIndex !== -1 ? history.slice(firstUserIndex) : [];

    // Initialize the chat session with past history
    const chat = model.startChat({
      history: validHistory.map((msg) => ({
        role: msg.role,
        parts: msg.parts,
      })),
    });

    let result = await chat.sendMessage(prompt);
    let functionCalls = result.response.functionCalls();

    // Loop to support multi-turn function calling
    while (functionCalls && functionCalls.length > 0) {
      const functionResponses = [];

      for (const call of functionCalls) {
        const { name, args } = call;
        addLog('call', `AI yêu cầu gọi công cụ: ${name}`);

        let functionResult: any;

        try {
          const rawArgs = args as any;
          if (name === 'readDatabase') {
            addLog(
              'info',
              `Đang đọc cơ sở dữ liệu tại đường dẫn: "${rawArgs.path}"...`
            );
            const pathRef = dbRef(database, rawArgs.path);
            const snapshot = await get(pathRef);
            if (snapshot.exists()) {
              const val = snapshot.val();
              functionResult = { exists: true, data: val };
              addLog(
                'success',
                `Đã đọc thành công dữ liệu từ "${rawArgs.path}".`
              );
            } else {
              functionResult = {
                exists: false,
                message: 'No data exists at this path',
              };
              addLog('info', `Không tìm thấy dữ liệu tại "${rawArgs.path}".`);
            }
          } else if (name === 'writeDatabase') {
            addLog(
              'info',
              `Đang ghi đè dữ liệu tại đường dẫn: "${rawArgs.path}"...`
            );
            const pathRef = dbRef(database, rawArgs.path);
            const parsedData = JSON.parse(rawArgs.dataJson);
            await set(pathRef, parsedData);
            functionResult = {
              success: true,
              message: `Dữ liệu đã được ghi đè tại "${rawArgs.path}".`,
            };
            addLog(
              'success',
              `Đã ghi đè thành công dữ liệu tại "${rawArgs.path}".`
            );
          } else if (name === 'updateDatabase') {
            addLog(
              'info',
              `Đang cập nhật dữ liệu tại đường dẫn: "${rawArgs.path}"...`
            );
            const pathRef = dbRef(database, rawArgs.path);
            const parsedData = JSON.parse(rawArgs.dataJson);
            await update(pathRef, parsedData);
            functionResult = {
              success: true,
              message: `Dữ liệu đã được cập nhật tại "${rawArgs.path}".`,
            };
            addLog(
              'success',
              `Đã cập nhật thành công dữ liệu tại "${rawArgs.path}".`
            );
          } else if (name === 'deleteDatabase') {
            addLog(
              'info',
              `Đang xóa dữ liệu tại đường dẫn: "${rawArgs.path}"...`
            );
            const pathRef = dbRef(database, rawArgs.path);
            await remove(pathRef);
            functionResult = {
              success: true,
              message: `Dữ liệu đã được xóa tại "${rawArgs.path}".`,
            };
            addLog(
              'success',
              `Đã xóa thành công dữ liệu tại "${rawArgs.path}".`
            );
          }
        } catch (error) {
          const errMsg = (error as Error).message || 'Lỗi xử lý công cụ.';
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

      addLog('info', 'AI đang tổng hợp dữ liệu từ các công cụ...');
      result = await chat.sendMessage(functionResponses);
      functionCalls = result.response.functionCalls();
    }

    const finalReply = result.response.text();
    addLog('success', 'Hoàn thành xử lý yêu cầu!');
    return finalReply;
  } catch (error) {
    const errMsg = (error as Error).message || 'Lỗi hệ thống trợ lý quản trị.';
    addLog('error', `Lỗi trợ lý: ${errMsg}`);
    throw error;
  }
}
