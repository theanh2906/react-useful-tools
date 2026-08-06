/**
 * @module views/AdminAiAssistant
 * @description Secure chat-based AI Assistant page reserved for Administrators, allowing database inspection and modification using Gemini.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Send,
  Settings,
  Key,
  Info,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
  Trash2,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, Button, TextArea } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { processAdminAiPrompt, type StepLog, type ChatHistoryMessage } from '@/services/adminGeminiService';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  logs?: StepLog[];
}

const SUGGESTED_PROMPTS = {
  vi: [
    { label: '🔍 Đọc danh sách Users', text: 'Đọc dữ liệu tại đường dẫn "users"' },
    { label: '📋 Xem Meal Check-ins', text: 'Đọc dữ liệu tại đường dẫn "mealCheckIns"' },
    { label: '⚙️ Đọc cấu hình chu kỳ Soya', text: 'Đọc cài đặt chu kỳ của Soya tại users/soya/cycleSettings' },
    { label: '💬 Hỏi đáp chung', text: 'Hãy giải thích cấu trúc cơ sở dữ liệu Firebase của ứng dụng này hoạt động thế nào' },
  ],
  en: [
    { label: '🔍 Read Users List', text: 'Read data at the path "users"' },
    { label: '📋 View Meal Check-ins', text: 'Read data at the path "mealCheckIns"' },
    { label: '⚙️ Soya Cycle Settings', text: 'Read settings for Soya at users/soya/cycleSettings' },
    { label: '💬 General Q&A', text: 'Explain how the Firebase Realtime Database structure works in this app' },
  ]
};

export default function AdminAiAssistant() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'vi').startsWith('vi') ? 'vi' : 'en';

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStepLogs, setCurrentStepLogs] = useState<StepLog[]>([]);
  
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasEnvKey, setHasEnvKey] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check for environment key or stored key on mount
  useEffect(() => {
    const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (envKey) {
      setHasEnvKey(true);
      setApiKey(envKey);
    } else {
      const storedKey = localStorage.getItem('gemini_api_key');
      if (storedKey) {
        setApiKey(storedKey);
      }
    }

    // Add initial intro message
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: t('adminAi.chatIntro'),
        timestamp: new Date(),
      }
    ]);
  }, [t]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, currentStepLogs]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error('Vui lòng nhập API Key');
      return;
    }
    localStorage.setItem('gemini_api_key', apiKey.trim());
    toast.success('Đã lưu Gemini API Key');
    setShowSettings(false);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    toast.info('Đã xóa Gemini API Key');
  };

  const handleStep = (step: StepLog) => {
    setCurrentStepLogs((prev) => [...prev, step]);
  };

  const handleSendPrompt = async (textToSend?: string) => {
    const activeText = textToSend || prompt;
    if (!activeText.trim()) return;

    if (!apiKey) {
      toast.error('Vui lòng cấu hình Gemini API Key trước');
      setShowSettings(true);
      return;
    }

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: activeText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    setCurrentStepLogs([]);

    // Map chat history for Gemini API (format: ChatHistoryMessage[])
    const history: ChatHistoryMessage[] = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    try {
      const response = await processAdminAiPrompt({
        prompt: activeText.trim(),
        apiKey: apiKey.trim(),
        history,
        onStep: handleStep,
      });

      const assistantMessage: ChatMessage = {
        id: 'model-' + Date.now(),
        role: 'model',
        content: response,
        timestamp: new Date(),
        logs: [...currentStepLogs],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error(error.message || t('adminAi.error'));
      
      const errorMessage: ChatMessage = {
        id: 'model-err-' + Date.now(),
        role: 'model',
        content: `❌ **Lỗi hệ thống:** ${error.message || 'Không thể nhận phản hồi từ AI'}`,
        timestamp: new Date(),
        logs: [...currentStepLogs],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setCurrentStepLogs([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: t('adminAi.chatIntro'),
        timestamp: new Date(),
      }
    ]);
    toast.info('Đã xóa lịch sử chat');
  };

  const toggleLogs = (messageId: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const activePrompts = SUGGESTED_PROMPTS[currentLang];
  const shouldShowChatPanel = Boolean(apiKey.trim()) || messages.length > 1 || isLoading;

  return (
    <div className="mx-auto flex h-[81vh] min-w-0 max-w-5xl flex-col gap-3 px-1 py-2 sm:h-[85vh] sm:gap-4 sm:p-4">
      {/* Header Panel */}
      <Card className="flex shrink-0 flex-col gap-2 overflow-hidden bg-elevated p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-accent-200 bg-accent-50 text-accent-600">
              <Terminal className="w-5 h-5 shrink-0" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="flex flex-col gap-1 font-display text-lg font-bold text-foreground sm:flex-row sm:items-center sm:gap-2 sm:text-xl">
                {t('adminAi.title')}
                <span className="w-fit rounded-md border border-accent-200 bg-accent-50 px-2 py-0.5 text-[10px] font-bold uppercase text-accent-700">
                  Admin Security
                </span>
              </h2>
              <p className="break-words text-xs text-muted">{t('adminAi.subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="h-10 min-w-0 px-3 text-muted hover:text-foreground"
              title={t('adminAi.clearChat')}
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-xs">{t('adminAi.clearChat')}</span>
            </Button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                'flex h-10 min-w-0 items-center justify-center rounded-md border text-muted transition-colors hover:text-foreground',
                showSettings ? 'border-accent-300 bg-accent-50 text-accent-700' : 'border-line bg-elevated hover:bg-surface'
              )}
              title="Configure API Key"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Drawer */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-1 overflow-hidden border-t border-line pt-3"
            >
              <div className="space-y-3 py-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Key className="size-3.5 text-accent-600" />
                    Gemini API Key
                  </span>
                  {hasEnvKey && (
                    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      System Env
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  placeholder={hasEnvKey ? 'Using system environment variable key...' : 'Enter AIzaSy...'}
                  disabled={hasEnvKey}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-100 disabled:bg-surface"
                />
                {!hasEnvKey && (
                  <div className="flex gap-2 justify-end">
                    {apiKey && (
                      <Button variant="danger" size="sm" onClick={handleClearApiKey}>
                        Delete Key
                      </Button>
                    )}
                    <Button size="sm" onClick={handleSaveApiKey}>
                      Save Key
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {shouldShowChatPanel && (
        <Card className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-elevated p-2 sm:p-4">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 custom-scrollbar">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={cn('flex gap-3 max-w-[90%] sm:max-w-[80%]', isUser ? 'ml-auto flex-row-reverse' : 'mr-auto')}
                >
                  {/* Avatar Bubble */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full shrink-0 flex items-center justify-center border',
                      isUser
                        ? 'border-accent-200 bg-accent-50 text-accent-600'
                        : 'border-line bg-surface text-foreground'
                    )}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1 min-w-0">
                    {/* Chat Content Bubble */}
                    <pre
                      className={cn(
                        'whitespace-pre-wrap break-words rounded-lg p-3.5 text-sm leading-relaxed',
                        isUser
                          ? 'rounded-tr-none bg-accent-500 font-sans text-white'
                          : 'rounded-tl-none border border-line bg-surface font-mono text-xs text-foreground'
                      )}
                    >
                      {msg.content}
                    </pre>

                    {/* Execution Step Logs (Collapsible) */}
                    {!isUser && msg.logs && msg.logs.length > 0 && (
                      <div className="mt-2 max-w-full overflow-hidden rounded-md border border-line bg-background">
                        <button
                          onClick={() => toggleLogs(msg.id)}
                          className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-semibold text-muted transition-colors hover:bg-surface hover:text-foreground"
                        >
                          <span className="flex items-center gap-1.5 uppercase tracking-wider">
                            <Terminal className="size-3.5 text-accent-600" />
                            {t('adminAi.processingLogs')} ({msg.logs.length})
                          </span>
                          {expandedLogs[msg.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <AnimatePresence>
                          {expandedLogs[msg.id] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="max-h-[160px] space-y-2.5 overflow-y-auto border-t border-line px-3 pb-3 pt-2 font-mono text-[11px] scrollbar-hide"
                            >
                              {msg.logs.map((log) => (
                                <div key={log.id} className="flex gap-2 items-start">
                                  {log.type === 'info' && <Info className="size-3.5 shrink-0 text-accent-600" />}
                                  {log.type === 'call' && <RefreshCw className="size-3.5 shrink-0 animate-spin text-accent-600" style={{ animationDuration: '3s' }} />}
                                  {log.type === 'success' && <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />}
                                  {log.type === 'error' && <AlertCircle className="size-3.5 shrink-0 text-rose-600" />}

                                  <div className="flex-1 min-w-0">
                                    <span className="mr-1.5 text-muted">{log.timestamp}</span>
                                    <span
                                      className={cn(
                                        log.type === 'success' ? 'text-emerald-700' :
                                        log.type === 'error' ? 'text-rose-700' :
                                        log.type === 'call' ? 'text-accent-700' : 'text-muted'
                                      )}
                                    >
                                      {log.message}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Real-time processing logs for active/running request */}
            {isLoading && (
              <div className="flex gap-3 max-w-[90%] sm:max-w-[80%]">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-foreground">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="space-y-2 w-full">
                  {/* Typing status bubble */}
                  <div className="inline-flex items-center gap-2 rounded-lg rounded-tl-none border border-line bg-surface px-4 py-3">
                    <Loader2 className="size-3.5 animate-spin text-accent-600" />
                    <span className="text-xs font-medium text-foreground">{t('adminAi.generating')}</span>
                  </div>

                  {/* Incremental active log updates */}
                  {currentStepLogs.length > 0 && (
                    <div className="max-h-[140px] space-y-2 overflow-y-auto rounded-md border border-line bg-background p-3 font-mono text-[11px]">
                      {currentStepLogs.map((log) => (
                        <div key={log.id} className="flex gap-2 items-start">
                          {log.type === 'info' && <Info className="size-3.5 shrink-0 text-accent-600" />}
                          {log.type === 'call' && <RefreshCw className="size-3.5 shrink-0 animate-spin text-accent-600" style={{ animationDuration: '3s' }} />}
                          {log.type === 'success' && <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />}
                          {log.type === 'error' && <AlertCircle className="size-3.5 shrink-0 text-rose-600" />}
                          <div className="flex-1 min-w-0">
                            <span className="mr-1.5 text-muted">{log.timestamp}</span>
                            <span className={log.type === 'success' ? 'text-emerald-700' : log.type === 'error' ? 'text-rose-700' : 'text-muted'}>
                              {log.message}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Warning if API key is missing */}
          {!apiKey.trim() && !showSettings && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-elevated/95 p-4 text-center sm:p-6">
              <div className="max-w-sm space-y-3">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                <h3 className="text-lg font-bold text-foreground">Gemini API Key Required</h3>
                <p className="text-xs leading-relaxed text-muted">
                  To activate the Admin AI assistant, configure <code>NEXT_PUBLIC_GEMINI_API_KEY</code> in your environment or enter it manually in the settings drawer.
                </p>
                <Button onClick={() => setShowSettings(true)} size="sm">
                  Open Settings
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Suggested Prompts & Chat Input Area */}
      <div className="shrink-0 flex flex-col gap-2.5">
        {/* Suggested Prompts Pills */}
        {!isLoading && messages.length <= 1 && (
          <div className="grid grid-cols-1 gap-2 sm:flex sm:overflow-x-auto sm:pb-1 sm:scrollbar-hide">
            {activePrompts.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSendPrompt(item.text)}
                className="min-w-0 rounded-md border border-line bg-elevated px-3 py-2 text-left text-xs font-medium text-muted transition-colors hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700 sm:shrink-0 sm:py-1.5"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Main Textarea Input Panel */}
        <div className="relative">
          <TextArea
            placeholder={t('adminAi.placeholder')}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || !apiKey}
            className="min-h-[70px] max-h-[140px] resize-y bg-elevated pr-14 text-sm text-foreground"
          />
          <button
            onClick={() => handleSendPrompt()}
            disabled={isLoading || !prompt.trim() || !apiKey}
            className={cn(
              'absolute bottom-3 right-3 rounded-md p-2.5 transition-colors',
              prompt.trim() && !isLoading && apiKey
                ? 'bg-primary-500 text-white shadow-sm hover:bg-primary-600'
                : 'cursor-not-allowed bg-surface text-muted'
            )}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
