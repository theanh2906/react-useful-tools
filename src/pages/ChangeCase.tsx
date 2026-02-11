import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Type, 
  Copy, 
  Check, 
  ArrowRight,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type CaseType = 
  | 'uppercase' 
  | 'lowercase' 
  | 'titlecase' 
  | 'sentencecase' 
  | 'camelcase' 
  | 'pascalcase'
  | 'snakecase' 
  | 'kebabcase' 
  | 'dotcase'
  | 'constantcase'
  | 'reverse'
  | 'alternating';

interface CaseOption {
  id: CaseType;
  label: string;
  description: string;
  example: string;
  transform: (text: string) => string;
}

const caseOptions: CaseOption[] = [
  {
    id: 'uppercase',
    label: 'UPPERCASE',
    description: 'Convert all letters to uppercase',
    example: 'HELLO WORLD',
    transform: (text) => text.toUpperCase()
  },
  {
    id: 'lowercase',
    label: 'lowercase',
    description: 'Convert all letters to lowercase',
    example: 'hello world',
    transform: (text) => text.toLowerCase()
  },
  {
    id: 'titlecase',
    label: 'Title Case',
    description: 'Capitalize first letter of each word',
    example: 'Hello World',
    transform: (text) => text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  },
  {
    id: 'sentencecase',
    label: 'Sentence case',
    description: 'Capitalize first letter of each sentence',
    example: 'Hello world. How are you?',
    transform: (text) => text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase())
  },
  {
    id: 'camelcase',
    label: 'camelCase',
    description: 'Remove spaces, capitalize each word except first',
    example: 'helloWorld',
    transform: (text) => text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^[A-Z]/, c => c.toLowerCase())
  },
  {
    id: 'pascalcase',
    label: 'PascalCase',
    description: 'Remove spaces, capitalize each word',
    example: 'HelloWorld',
    transform: (text) => text
      .toLowerCase()
      .replace(/(?:^|[^a-zA-Z0-9]+)(.)/g, (_, c) => c.toUpperCase())
  },
  {
    id: 'snakecase',
    label: 'snake_case',
    description: 'Replace spaces with underscores',
    example: 'hello_world',
    transform: (text) => text
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
  },
  {
    id: 'kebabcase',
    label: 'kebab-case',
    description: 'Replace spaces with hyphens',
    example: 'hello-world',
    transform: (text) => text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
  },
  {
    id: 'dotcase',
    label: 'dot.case',
    description: 'Replace spaces with dots',
    example: 'hello.world',
    transform: (text) => text
      .toLowerCase()
      .replace(/\s+/g, '.')
      .replace(/[^a-zA-Z0-9.]/g, '')
  },
  {
    id: 'constantcase',
    label: 'CONSTANT_CASE',
    description: 'Uppercase with underscores',
    example: 'HELLO_WORLD',
    transform: (text) => text
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/[^A-Z0-9_]/g, '')
  },
  {
    id: 'reverse',
    label: 'esreveR',
    description: 'Reverse the text',
    example: 'dlrow olleh',
    transform: (text) => text.split('').reverse().join('')
  },
  {
    id: 'alternating',
    label: 'aLtErNaTiNg',
    description: 'Alternate between lower and upper case',
    example: 'hElLo WoRlD',
    transform: (text) => text
      .split('')
      .map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase())
      .join('')
  }
];

export default function ChangeCase() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedCase, setSelectedCase] = useState<CaseType | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleTransform = useCallback((caseType: CaseType) => {
    if (!inputText.trim()) return;
    
    const option = caseOptions.find(o => o.id === caseType);
    if (!option) return;

    const result = option.transform(inputText);
    setOutputText(result);
    setSelectedCase(caseType);
    
    // Add to history
    if (!history.includes(result)) {
      setHistory(prev => [result, ...prev].slice(0, 10));
    }
  }, [inputText, history]);

  const handleCopy = useCallback(async () => {
    if (!outputText) return;
    
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [outputText]);

  const handleClear = useCallback(() => {
    setInputText('');
    setOutputText('');
    setSelectedCase(null);
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length > 1) {
      setOutputText(history[1]);
      setHistory(prev => prev.slice(1));
    }
  }, [history]);

  const stats = {
    characters: inputText.length,
    words: inputText.trim() ? inputText.trim().split(/\s+/).length : 0,
    lines: inputText ? inputText.split('\n').length : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Change Case
          </h1>
          <p className="text-white/60 mt-1">
            Transform text between different cases
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Type className="w-5 h-5 text-violet-400" />
                Input Text
              </h2>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <span>{stats.characters} chars</span>
                <span>•</span>
                <span>{stats.words} words</span>
                <span>•</span>
                <span>{stats.lines} lines</span>
              </div>
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter or paste your text here..."
              className="w-full h-64 bg-white/5 border border-white/10 rounded-xl p-4 
                       text-white placeholder-white/30 resize-none
                       focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
                       transition-all"
            />

            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={!inputText}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={history.length <= 1}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Undo
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Output Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-emerald-400" />
                Output
                {selectedCase && (
                  <span className="text-sm font-normal text-white/50">
                    ({caseOptions.find(o => o.id === selectedCase)?.label})
                  </span>
                )}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!outputText}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            
            <div className="w-full h-64 bg-white/5 border border-white/10 rounded-xl p-4 
                          text-white overflow-auto whitespace-pre-wrap break-words">
              {outputText || (
                <span className="text-white/30">
                  Transformed text will appear here...
                </span>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Case Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Select Case Type
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {caseOptions.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => handleTransform(option.id)}
                disabled={!inputText.trim()}
                className={`
                  p-4 rounded-xl border transition-all text-left
                  ${selectedCase === option.id
                    ? 'bg-violet-500/20 border-violet-500/50 ring-2 ring-violet-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                  ${!inputText.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="font-mono text-sm text-violet-400 mb-1">
                  {option.label}
                </div>
                <div className="text-xs text-white/40 truncate">
                  {option.example}
                </div>
              </motion.button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Quick Reference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Quick Reference
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseOptions.slice(0, 6).map((option) => (
              <div 
                key={option.id}
                className="p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="font-mono text-violet-400 text-sm mb-1">
                  {option.label}
                </div>
                <div className="text-white/60 text-xs">
                  {option.description}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
