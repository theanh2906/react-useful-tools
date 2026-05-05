/**
 * @module QrScannerPage
 * @description QR code scanner that reads QR codes from uploaded images using jsQR.
 */
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Image as ImageIcon,
  Copy,
  Check,
  Scan,
  AlertCircle,
} from 'lucide-react';
import jsQR from 'jsqr';
import { Card, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';

/**
 * QR code scanner page.
 * Allows users to upload or paste an image and decodes any embedded QR code.
 */
export function QrScannerPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);
      scanImage(src);
    };
    reader.readAsDataURL(file);
  };

  const scanImage = (src: string) => {
    setIsScanning(true);
    setError(null);
    setResult(null);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Could not initialize canvas');
        setIsScanning(false);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code?.data) {
        setResult(code.data);
      } else {
        setError('No QR code detected in this image.');
      }

      setIsScanning(false);
    };
    img.onerror = () => {
      setError('Could not read the image.');
      setIsScanning(false);
    };
    img.src = src;
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">
          QR Scanner
        </h1>
        <p className="text-slate-400 mt-1">Scan QR codes from images</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div
              className={cn(
                'border-2 border-dashed rounded-2xl p-8 text-center transition-all',
                imageSrc
                  ? 'border-primary-500/30 bg-primary-500/5'
                  : 'border-white/10 hover:border-white/20'
              )}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Upload QR image</p>
                  <p className="text-sm text-slate-400">PNG, JPG, or WEBP</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Scan className="w-4 h-4" />
                  Choose Image
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:w-80 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="info">Scan Result</Badge>
              {isScanning && <Badge variant="warning">Scanning...</Badge>}
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 min-h-[140px]">
              {result ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-300 break-all">{result}</p>
                  <Button size="sm" onClick={handleCopy}>
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              ) : error ? (
                <div className="flex items-start gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Upload an image to scan.
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {imageSrc && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="primary">Preview</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scanImage(imageSrc)}
            >
              <Camera className="w-4 h-4" />
              Rescan
            </Button>
          </div>
          <img
            src={imageSrc}
            alt="QR preview"
            className="max-h-[400px] w-full object-contain rounded-xl"
          />
        </Card>
      )}
    </motion.div>
  );
}

export default QrScannerPage;
