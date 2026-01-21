import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, QrCode } from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';

export function QrGeneratorPage() {
  const [text, setText] = useState('https://useful-tools.app');
  const [size, setSize] = useState(280);
  const [fgColor, setFgColor] = useState('#111827');
  const [bgColor, setBgColor] = useState('#ffffff');

  const qrUrl = useMemo(() => {
    const fg = fgColor.replace('#', '');
    const bg = bgColor.replace('#', '');
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      text
    )}&color=${fg}&bgcolor=${bg}`;
  }, [text, size, fgColor, bgColor]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = 'qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR downloaded');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">QR Generator</h1>
        <p className="text-slate-400 mt-1">Generate QR codes for links and text</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <Input
            label="Text / URL"
            placeholder="Enter content..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Size (px)"
              type="number"
              min={120}
              max={600}
              value={size}
              onChange={(e) => setSize(Number(e.target.value || 280))}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Colors</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-400">
                  <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
                  Foreground
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-400">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                  Background
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setText('https://useful-tools.app');
                setSize(280);
                setFgColor('#111827');
                setBgColor('#ffffff');
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center">
          <Badge variant="primary" className="mb-4">
            Preview
          </Badge>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            {text ? (
              <img
                src={qrUrl}
                alt="QR Code"
                className={cn('rounded-xl', size > 360 ? 'w-[360px]' : 'w-[280px]')}
              />
            ) : (
              <div className="w-[280px] h-[280px] flex items-center justify-center text-slate-500">
                <QrCode className="w-12 h-12" />
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-4">QR generated via public API</p>
        </Card>
      </div>
    </motion.div>
  );
}

export default QrGeneratorPage;
