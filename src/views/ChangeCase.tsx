/**
 * @module ChangeCase
 * @description Text case conversion tool supporting 10+ case formats
 * (uppercase, camelCase, snake_case, etc.).
 */
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Type, Copy, Check, ArrowRight, Trash2, RotateCcw } from 'lucide-react';
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
    transform: (text) => text.toUpperCase(),
  },
  {
    id: 'lowercase',
    label: 'lowercase',
    description: 'Convert all letters to lowercase',
    example: 'hello world',
    transform: (text) => text.toLowerCase(),
  },
  {
    id: 'titlecase',
    label: 'Title Case',
    description: 'Capitalize first letter of each word',
    example: 'Hello World',
    transform: (text) =>
      text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    id: 'sentencecase',
    label: 'Sentence case',
    description: 'Capitalize first letter of each sentence',
    example: 'Hello world. How are you?',
    transform: (text) =>
      text
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
  },
  {
    id: 'camelcase',
    label: 'camelCase',
    description: 'Remove spaces, capitalize each word except first',
    example: 'helloWorld',
    transform: (text) =>
      text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
        .replace(/^[A-Z]/, (c) => c.toLowerCase()),
  },
  {
    id: 'pascalcase',
    label: 'PascalCase',
    description: 'Remove spaces, capitalize each word',
    example: 'HelloWorld',
    transform: (text) =>
      text
        .toLowerCase()
        .replace(/(?:^|[^a-zA-Z0-9]+)(.)/g, (_, c) => c.toUpperCase()),
  },
  {
    id: 'snakecase',
    label: 'snake_case',
    description: 'Replace spaces with underscores',
    example: 'hello_world',
    transform: (text) =>
      text
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, ''),
  },
  {
    id: 'kebabcase',
    label: 'kebab-case',
    description: 'Replace spaces with hyphens',
    example: 'hello-world',
    transform: (text) =>
      text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, ''),
  },
  {
    id: 'dotcase',
    label: 'dot.case',
    description: 'Replace spaces with dots',
    example: 'hello.world',
    transform: (text) =>
      text
        .toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[^a-zA-Z0-9.]/g, ''),
  },
  {
    id: 'constantcase',
    label: 'CONSTANT_CASE',
    description: 'Uppercase with underscores',
    example: 'HELLO_WORLD',
    transform: (text) =>
      text
        .toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/[^A-Z0-9_]/g, ''),
  },
  {
    id: 'reverse',
    label: 'esreveR',
    description: 'Reverse the text',
    example: 'dlrow olleh',
    transform: (text) => text.split('').reverse().join(''),
  },
  {
    id: 'alternating',
    label: 'aLtErNaTiNg',
    description: 'Alternate between lower and upper case',
    example: 'hElLo WoRlD',
    transform: (text) =>
      text
        .split('')
        .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
        .join(''),
  },
];

/**
 * Text case converter page.
 * Provides a textarea input and converts text to the selected case format
 * with one-click copy to clipboard.
 */
export default function ChangeCase() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedCase, setSelectedCase] = useState<CaseType | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleTransform = useCallback(
    (caseType: CaseType) => {
      if (!inputText.trim()) return;

      const option = caseOptions.find((o) => o.id === caseType);
      if (!option) return;

      const result = option.transform(inputText);
      setOutputText(result);
      setSelectedCase(caseType);

      // Add to history
      if (!history.includes(result)) {
        setHistory((prev) => [result, ...prev].slice(0, 10));
      }
    },
    [inputText, history]
  );

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
      setHistory((prev) => prev.slice(1));
    }
  }, [history]);

  const stats = {
    characters: inputText.length,
    words: inputText.trim() ? inputText.trim().split(/\s+/).length : 0,
    lines: inputText ? inputText.split('\n').length : 0,
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
          <h1 className="font-display text-3xl font-bold text-foreground">
            Change Case
          </h1>
          <p className="mt-1 text-muted">
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
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Type className="h-5 w-5 text-accent-500" />
                Input Text
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted">
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
              className="h-64 w-full resize-none rounded-lg border border-line bg-elevated p-4 text-foreground placeholder:text-muted transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-100"
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
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <ArrowRight className="h-5 w-5 text-emerald-600" />
                Output
                {selectedCase && (
                  <span className="text-sm font-normal text-muted">
                    ({caseOptions.find((o) => o.id === selectedCase)?.label})
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
                    <Check className="mr-2 h-4 w-4 text-emerald-600" />
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

            <div className="h-64 w-full overflow-auto whitespace-pre-wrap break-words rounded-lg border border-line bg-surface p-4 text-foreground">
              {outputText || (
                <span className="text-muted">
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
          <h2 className="mb-4 text-lg font-semibold text-foreground">
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
                  rounded-lg border p-4 text-left transition-colors
                  ${
                    selectedCase === option.id
                      ? 'border-accent-300 bg-accent-50 ring-2 ring-accent-100'
                      : 'border-line bg-elevated hover:border-accent-200 hover:bg-surface'
                  }
                  ${!inputText.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="mb-1 font-mono text-sm text-accent-700">
                  {option.label}
                </div>
                <div className="truncate text-xs text-muted">
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
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Quick Reference
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseOptions.slice(0, 6).map((option) => (
              <div
                key={option.id}
                className="rounded-lg border border-line bg-surface p-3"
              >
                <div className="mb-1 font-mono text-sm text-accent-700">
                  {option.label}
                </div>
                <div className="text-xs text-muted">{option.description}</div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
