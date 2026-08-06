/**
 * @module components/calendar/CalendarAiAssistant
 * @description AI Assistant panel for managing calendar events using Gemini.
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
        'relative flex flex-col gap-4 overflow-hidden border bg-elevated p-5 transition-colors duration-200',
        isLoading
          ? 'border-accent-300'
          : 'border-line'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-accent-200 bg-accent-50 p-1.5 text-accent-600">
            <Sparkles className={cn('w-4 h-4', isLoading && 'animate-pulse')} />
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
              Trợ Lý Lịch AI
              {isLoading && (
                <span className="flex h-2 w-2 relative">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500"></span>
                </span>
              )}
            </h3>
            <p className="text-xs text-muted">Quản lý lịch bằng ngôn ngữ tự nhiên</p>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            'rounded-md border p-1.5 text-muted transition-colors hover:text-foreground',
            showSettings
              ? 'border-accent-300 bg-accent-50 text-accent-600'
              : 'border-line bg-elevated hover:bg-surface'
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
            className="overflow-hidden border-b border-line pb-4"
          >
            <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Key className="h-3.5 w-3.5 text-accent-500" />
                  Gemini API Key
                </span>
                {hasEnvKey && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
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
                className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent-500 focus:outline-none"
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
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-amber-900">Chưa cấu hình API Key</h4>
            <p className="text-xs leading-relaxed text-amber-800">
              Bạn cần thêm Gemini API Key vào file <code>.env.local</code> dưới dạng{' '}
              <code>NEXT_PUBLIC_GEMINI_API_KEY</code> hoặc cấu hình trực tiếp trong phần Cài đặt.
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="text-xs font-medium text-amber-700 underline transition-colors hover:text-amber-900"
            >
              Cấu hình ngay
            </button>
          </div>
        </div>
      )}

      {/* Suggested Prompts */}
      {!isLoading && logs.length === 0 && (
        <div className="space-y-2">
          <span className="block text-[11px] font-semibold uppercase text-muted">Gợi ý yêu cầu</span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((item, index) => (
              <button
                key={index}
                onClick={() => setPrompt(item.text)}
                className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-left text-xs text-foreground transition-colors hover:border-accent-200 hover:bg-accent-50"
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
          className="min-h-[90px] border-line bg-elevated pr-12 text-sm text-foreground focus:border-accent-500"
        />
        <button
          onClick={handleSendPrompt}
          disabled={isLoading || !prompt.trim()}
          className={cn(
            'absolute bottom-3 right-3 rounded-md p-2 transition-colors',
            prompt.trim() && !isLoading
              ? 'bg-primary-500 text-white shadow-sm hover:bg-primary-600'
              : 'cursor-not-allowed bg-surface text-muted'
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
        <div className="custom-scrollbar flex max-h-[220px] flex-col gap-3 overflow-y-auto rounded-lg border border-line bg-surface p-4">
          <div className="mb-1 flex items-center justify-between border-b border-line pb-2">
            <span className="text-[10px] font-semibold uppercase text-muted">Hành trình xử lý</span>
            {logs.length > 0 && !isLoading && (
              <button
                onClick={() => setLogs([])}
                className="text-[10px] text-muted transition-colors hover:text-foreground"
              >
                Xóa nhật ký
              </button>
            )}
          </div>
          <div className="space-y-3">
            {logs.map((log) => {
              if (log.id === 'final-reply') {
                return (
                  <div key={log.id} className="mt-2 flex items-start gap-2.5 rounded-md border border-accent-200 bg-accent-50 p-3">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
                    <div className="space-y-1">
                      <span className="block text-[10px] font-semibold text-accent-700">AI phản hồi:</span>
                      <p className="whitespace-pre-line text-xs leading-relaxed text-foreground">{log.message}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div key={log.id} className="flex gap-2 items-start text-xs">
                  {log.type === 'info' && <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-500" />}
                  {log.type === 'call' && <RefreshCw className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-accent-600" style={{ animationDuration: '3s' }} />}
                  {log.type === 'success' && <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />}
                  {log.type === 'error' && <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />}
                  
                  <div className="flex-1 min-w-0">
                    <span className="mr-1.5 font-mono text-[10px] text-muted">{log.timestamp}</span>
                    <span className={cn(
                      'leading-relaxed font-medium',
                      log.type === 'success' ? 'text-emerald-700' :
                      log.type === 'error' ? 'text-red-700' :
                      log.type === 'call' ? 'font-mono text-accent-700' : 'text-foreground'
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
