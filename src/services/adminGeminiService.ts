/**
 * @module services/adminGeminiService
 * @description Unsupported placeholder for the former client-side admin database assistant.
 */

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

export async function processAdminAiPrompt(
  _params: ProcessAdminAiPromptParams
): Promise<string> {
  throw new Error(
    'Admin AI database access is unsupported until it is moved behind a server-side Firebase Admin SDK API.'
  );
}
