/**
 * @module views/AdminAiAssistant
 * @description Secure chat-based AI Assistant page reserved for Administrators, allowing database inspection and modification using Gemini.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
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

  return (
    <div className="flex flex-col h-[81vh] sm:h-[85vh] max-w-5xl mx-auto p-2 sm:p-4 gap-4">
      {/* Header Panel */}
      <Card className="flex flex-col gap-2 p-4 bg-slate-950/40 backdrop-blur-xl border-white/10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white border border-indigo-400/20">
              <Terminal className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                {t('adminAi.title')}
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                  Admin Security
                </span>
              </h2>
              <p className="text-xs text-slate-400">{t('adminAi.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="text-slate-400 hover:text-white"
              title={t('adminAi.clearChat')}
            >
              <Trash2 className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline text-xs">{t('adminAi.clearChat')}</span>
            </Button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                'p-2 rounded-lg border text-slate-400 hover:text-white transition-all',
                showSettings ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10'
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
              className="overflow-hidden border-t border-white/5 pt-3 mt-1"
            >
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-400" />
                    Gemini API Key
                  </span>
                  {hasEnvKey && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/25">
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
                  className="w-full px-3 py-2 bg-slate-950/60 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
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

      {/* Chat Messages Log Panel */}
      <Card className="flex-1 flex flex-col min-h-0 bg-slate-950/20 border-white/10 p-2 sm:p-4 overflow-hidden relative">
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
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                      : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                  )}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  {/* Chat Content Bubble */}
                  <pre
                    className={cn(
                      'p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words',
                      isUser
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-none shadow-md font-sans'
                        : 'bg-white/5 border border-white/10 text-slate-100 rounded-tl-none font-mono text-xs'
                    )}
                  >
                    {msg.content}
                  </pre>

                  {/* Execution Step Logs (Collapsible) */}
                  {!isUser && msg.logs && msg.logs.length > 0 && (
                    <div className="mt-2 bg-slate-950/40 border border-white/5 rounded-xl overflow-hidden max-w-full">
                      <button
                        onClick={() => toggleLogs(msg.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold text-slate-400 hover:text-white transition-colors"
                      >
                        <span className="flex items-center gap-1.5 uppercase tracking-wider">
                          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
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
                            className="px-3 pb-3 border-t border-white/5 pt-2 text-[11px] font-mono space-y-2.5 max-h-[160px] overflow-y-auto scrollbar-hide"
                          >
                            {msg.logs.map((log) => (
                              <div key={log.id} className="flex gap-2 items-start">
                                {log.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                                {log.type === 'call' && <RefreshCw className="w-3.5 h-3.5 text-purple-400 shrink-0 animate-spin" style={{ animationDuration: '3s' }} />}
                                {log.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                                {log.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}

                                <div className="flex-1 min-w-0">
                                  <span className="text-slate-500 mr-1.5">{log.timestamp}</span>
                                  <span
                                    className={cn(
                                      log.type === 'success' ? 'text-emerald-400' :
                                      log.type === 'error' ? 'text-rose-400' :
                                      log.type === 'call' ? 'text-purple-300' : 'text-slate-400'
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
              <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="space-y-2 w-full">
                {/* Typing status bubble */}
                <div className="inline-flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none">
                  <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                  <span className="text-xs text-slate-300 font-medium">{t('adminAi.generating')}</span>
                </div>

                {/* Incremental active log updates */}
                {currentStepLogs.length > 0 && (
                  <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 text-[11px] font-mono space-y-2 max-h-[140px] overflow-y-auto">
                    {currentStepLogs.map((log) => (
                      <div key={log.id} className="flex gap-2 items-start">
                        {log.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                        {log.type === 'call' && <RefreshCw className="w-3.5 h-3.5 text-purple-400 shrink-0 animate-spin" style={{ animationDuration: '3s' }} />}
                        {log.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {log.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <span className="text-slate-500 mr-1.5">{log.timestamp}</span>
                          <span className={log.type === 'success' ? 'text-emerald-400' : log.type === 'error' ? 'text-rose-400' : 'text-slate-400'}>
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
        {!apiKey && !showSettings && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 text-center z-10">
            <div className="max-w-sm space-y-3">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">Gemini API Key Required</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                To activate the Admin AI assistant, configure <code>NEXT_PUBLIC_GEMINI_API_KEY</code> in your environment or enter it manually in the settings drawer.
              </p>
              <Button onClick={() => setShowSettings(true)} size="sm">
                Open Settings
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Suggested Prompts & Chat Input Area */}
      <div className="shrink-0 flex flex-col gap-2.5">
        {/* Suggested Prompts Pills */}
        {!isLoading && messages.length <= 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
            {activePrompts.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSendPrompt(item.text)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all text-left font-medium"
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
            className="pr-12 text-sm bg-slate-950/40 border-white/10 text-white min-h-[70px] max-h-[140px] focus:border-indigo-500/50 resize-y"
          />
          <button
            onClick={() => handleSendPrompt()}
            disabled={isLoading || !prompt.trim() || !apiKey}
            className={cn(
              'absolute right-3 bottom-3 p-2.5 rounded-xl transition-all',
              prompt.trim() && !isLoading && apiKey
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            )}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
