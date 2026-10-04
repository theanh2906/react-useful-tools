'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './cheatsheets.module.css';

/** Lightweight shell highlighting; content is always rendered as plain text. */
export function ShellCommand({ command }: { command: string }) {
  const parts = command.split(/("[^"]*"|'[^']*'|\s+)/g);
  return (
    <code>
      {parts.map((part, index) => {
        const className = /^['"]/.test(part)
          ? styles.tokenString
          : /^--?[\w]/.test(part)
            ? styles.tokenFlag
            : /^(git|gh|twg)$/.test(part)
              ? styles.tokenProgram
              : undefined;
        return (
          <span key={index} className={className}>
            {part}
          </span>
        );
      })}
    </code>
  );
}

export default function CommandExample({
  example,
  title,
}: {
  example: string;
  title: string;
}) {
  const { t } = useTranslation();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>(
    'idle'
  );
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timeout.current), []);

  const copyExample = async () => {
    clearTimeout(timeout.current);
    try {
      await navigator.clipboard.writeText(example);
      setCopyState('copied');
      timeout.current = setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('error');
    }
  };

  return (
    <div className={styles.exampleWrap}>
      <div className={styles.example}>
        <span className={styles.prompt} aria-hidden="true">
          $
        </span>
        <pre tabIndex={0} aria-label={`${t('cheatsheets.example')}: ${title}`}>
          <ShellCommand command={example} />
        </pre>
        <button
          type="button"
          onClick={() => void copyExample()}
          className={styles.copyButton}
          aria-label={t('cheatsheets.copyCommand', { title })}
          title={t(copyState === 'copied' ? 'common.copied' : 'common.copy')}
        >
          {copyState === 'copied' ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
      <span
        className={copyState === 'error' ? styles.copyError : styles.srOnly}
        role="status"
        aria-live="polite"
      >
        {copyState === 'copied' && t('common.copied')}
        {copyState === 'error' && t('cheatsheets.copyError')}
      </span>
    </div>
  );
}
