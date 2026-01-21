import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Copy, Check, RefreshCw } from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';
import CryptoJS from 'crypto-js';
import { toast } from '@/components/ui/Toast';

const algorithms = [
  { id: 'AES', label: 'AES' },
  { id: 'DES', label: 'DES' },
  { id: 'TripleDES', label: 'Triple DES' },
  { id: 'RC4', label: 'RC4' },
];

export function CryptoToolsPage() {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [algorithm, setAlgorithm] = useState('AES');
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!text || !key) return '';
    try {
      switch (algorithm) {
        case 'AES':
          return mode === 'encrypt'
            ? CryptoJS.AES.encrypt(text, key).toString()
            : CryptoJS.AES.decrypt(text, key).toString(CryptoJS.enc.Utf8);
        case 'DES':
          return mode === 'encrypt'
            ? CryptoJS.DES.encrypt(text, key).toString()
            : CryptoJS.DES.decrypt(text, key).toString(CryptoJS.enc.Utf8);
        case 'TripleDES':
          return mode === 'encrypt'
            ? CryptoJS.TripleDES.encrypt(text, key).toString()
            : CryptoJS.TripleDES.decrypt(text, key).toString(CryptoJS.enc.Utf8);
        case 'RC4':
          return mode === 'encrypt'
            ? CryptoJS.RC4.encrypt(text, key).toString()
            : CryptoJS.RC4.decrypt(text, key).toString(CryptoJS.enc.Utf8);
        default:
          return '';
      }
    } catch {
      return '';
    }
  }, [text, key, algorithm, mode]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">Crypto Tools</h1>
        <p className="text-slate-400 mt-1">Encrypt and decrypt text securely</p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {['encrypt', 'decrypt'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as 'encrypt' | 'decrypt')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                mode === m
                  ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {m === 'encrypt' ? 'Encrypt' : 'Decrypt'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {algorithms.map((alg) => (
            <button
              key={alg.id}
              onClick={() => setAlgorithm(alg.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                algorithm === alg.id
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {alg.label}
            </button>
          ))}
        </div>

        <Input
          label={mode === 'encrypt' ? 'Plain Text' : 'Encrypted Text'}
          placeholder={mode === 'encrypt' ? 'Enter text to encrypt...' : 'Paste encrypted text...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Input
          label="Secret Key"
          placeholder="Enter secret key..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="primary">Output</Badge>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <p className="text-sm text-slate-300 break-all">{output || 'Output will appear here.'}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setText(output)}>
            {mode === 'encrypt' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            Use output as input
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setText('');
              setKey('');
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export default CryptoToolsPage;
