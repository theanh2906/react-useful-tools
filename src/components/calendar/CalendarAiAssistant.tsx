/**
 * @module components/calendar/CalendarAiAssistant
 * @description Glassmorphic, premium AI Assistant panel for managing calendar events using Gemini.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Settings,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Card, Button, TextArea } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { processAiPrompt, type StepLog } from '@/services/geminiService';
import { cn } from '@/lib/utils';

const SUGGESTED_PROMPTS = [
  { label: '🎂 Sinh nhật Mẹ', text: 'Tạo sự kiện Sinh Nhật Mẹ vào ngày 23/10 hằng năm' },
  { label: '👥 Họp nhóm', text: 'Tạo lịch Họp nhóm vào lúc 9h sáng thứ hai tuần sau tại văn phòng' },
  { label: '🗓️ Đổi lịch họp', text: 'Đổi lịch họp ngày mai sang 15:00' },
  { label: '❌ Xóa sự kiện', text: 'Xóa toàn bộ sự kiện Sinh Nhật Mẹ ra khỏi lịch' },
];

export function CalendarAiAssistant() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<StepLog[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasEnvKey, setHasEnvKey] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

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
  }, []);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

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
    setLogs((prev) => [...prev, step]);
  };

  const handleSendPrompt = async () => {
    if (!prompt.trim()) {
      toast.error('Vui lòng nhập yêu cầu của bạn');
      return;
    }

    if (!apiKey) {
      toast.error('Vui lòng cấu hình Gemini API Key trước');
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    setLogs([]);

    try {
      const response = await processAiPrompt({
        prompt: prompt.trim(),
        apiKey: apiKey.trim(),
        onStep: handleStep,
      });

      toast.success('Xử lý thành công!');
      setPrompt('');
      
      // Add final text reply to logs
      setLogs((prev) => [
        ...prev,
        {
          id: 'final-reply',
          timestamp: new Date().toLocaleTimeString(),
          type: 'success',
          message: response,
        },
      ]);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xử lý yêu cầu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  const activeKey = hasEnvKey ? 'Cấu hình qua hệ thống (Env)' : apiKey ? 'Cấu hình cục bộ (Local)' : '';

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-500 border bg-slate-950/40 backdrop-blur-xl p-5 flex flex-col gap-4',
        isLoading
          ? 'border-indigo-500/50 shadow-[0_0_25px_-5px_rgba(99,102,241,0.2)]'
          : 'border-white/10 shadow-lg'
      )}
    >
      {/* Glow Effect */}
      <div
        className={cn(
          'absolute -right-24 -top-24 w-48 h-48 rounded-full filter blur-[80px] pointer-events-none transition-all duration-1000',
          isLoading ? 'bg-indigo-500/20' : 'bg-primary-500/10'
        )}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className={cn('w-4 h-4', isLoading && 'animate-pulse')} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white text-base flex items-center gap-2">
              Trợ Lý Lịch AI
              {isLoading && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Quản lý lịch bằng ngôn ngữ tự nhiên</p>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            'p-1.5 rounded-lg border text-slate-400 hover:text-white transition-all',
            showSettings
              ? 'bg-white/10 border-white/20'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          )}
          title="Cấu hình API Key"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/5 pb-4"
          >
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  Gemini API Key
                </span>
                {hasEnvKey && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/25">
                    Môi trường
                  </span>
                )}
              </div>
              <input
                type="password"
                placeholder={hasEnvKey ? 'Đang dùng API Key từ biến môi trường...' : 'Nhập AIzaSy...'}
                disabled={hasEnvKey}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
              {!hasEnvKey && (
                <div className="flex gap-2 justify-end">
                  {apiKey && (
                    <Button variant="danger" size="sm" onClick={handleClearApiKey}>
                      Xóa
                    </Button>
                  )}
                  <Button size="sm" onClick={handleSaveApiKey}>
                    Lưu cấu hình
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main interface */}
      {!apiKey && !showSettings && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-amber-200">Chưa cấu hình API Key</h4>
            <p className="text-xs text-amber-300/80 leading-relaxed">
              Bạn cần thêm Gemini API Key vào file <code>.env.local</code> dưới dạng{' '}
              <code>NEXT_PUBLIC_GEMINI_API_KEY</code> hoặc cấu hình trực tiếp trong phần Cài đặt.
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="text-xs font-medium text-amber-400 underline hover:text-amber-300 transition-colors"
            >
              Cấu hình ngay
            </button>
          </div>
        </div>
      )}

      {/* Suggested Prompts */}
      {!isLoading && logs.length === 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Gợi ý yêu cầu</span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((item, index) => (
              <button
                key={index}
                onClick={() => setPrompt(item.text)}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all text-left"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompt input */}
      <div className="relative">
        <TextArea
          placeholder="Ví dụ: Tạo sự kiện Sinh Nhật Mẹ vào ngày 23/10 hằng năm..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="pr-12 text-sm bg-slate-950/40 border-white/10 text-white min-h-[90px] focus:border-indigo-500/50"
        />
        <button
          onClick={handleSendPrompt}
          disabled={isLoading || !prompt.trim()}
          className={cn(
            'absolute right-3 bottom-3 p-2 rounded-xl transition-all',
            prompt.trim() && !isLoading
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              : 'bg-white/5 text-slate-500 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Progress logs & Final response */}
      {logs.length > 0 && (
        <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 flex flex-col gap-3 max-h-[220px] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Hành trình xử lý</span>
            {logs.length > 0 && !isLoading && (
              <button
                onClick={() => setLogs([])}
                className="text-[10px] text-slate-400 hover:text-white transition-colors"
              >
                Xóa nhật ký
              </button>
            )}
          </div>
          <div className="space-y-3">
            {logs.map((log) => {
              if (log.id === 'final-reply') {
                return (
                  <div key={log.id} className="mt-2 bg-indigo-500/10 border border-indigo-500/25 p-3 rounded-lg flex gap-2.5 items-start">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-indigo-300 block">AI phản hồi:</span>
                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{log.message}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div key={log.id} className="flex gap-2 items-start text-xs">
                  {log.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />}
                  {log.type === 'call' && <RefreshCw className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '3s' }} />}
                  {log.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                  {log.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />}
                  
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-500 font-mono mr-1.5">{log.timestamp}</span>
                    <span className={cn(
                      'leading-relaxed font-medium',
                      log.type === 'success' ? 'text-emerald-300' :
                      log.type === 'error' ? 'text-rose-300' :
                      log.type === 'call' ? 'text-purple-300 font-mono' : 'text-slate-300'
                    )}>
                      {log.message}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </Card>
  );
}
