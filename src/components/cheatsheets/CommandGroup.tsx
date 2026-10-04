import { ArrowUpRight, CircleAlert, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CheatsheetGroup } from '@/data/cheatsheets';
import CommandExample from './CommandExample';
import styles from './cheatsheets.module.css';

export default function CommandGroup({
  group,
  index,
  tool,
}: {
  group: CheatsheetGroup;
  index: number;
  tool: string;
}) {
  const { t } = useTranslation();
  const headingId = `${tool}-${group.id}-heading`;

  return (
    <section
      className={styles.group}
      data-color={index % 6}
      aria-labelledby={headingId}
    >
      <header className={styles.groupHeader}>
        <span className={styles.groupNumber} aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 id={headingId}>{group.title}</h3>
        <span className={styles.groupCount}>{group.commands.length}</span>
      </header>
      <div className={styles.groupCommands}>
        {group.commands.map((command) => (
          <article key={command.id} className={styles.command}>
            <div className={styles.commandTitle}>
              <h4>{command.title}</h4>
              {command.risk !== 'read' && (
                <span className={styles.risk} data-risk={command.risk}>
                  {t(`cheatsheets.risk.${command.risk}`)}
                </span>
              )}
            </div>
            <code className={styles.syntax}>{command.command}</code>
            <p className={styles.commandDescription}>{command.description}</p>
            {command.warning && (
              <p className={styles.warning} data-risk={command.risk}>
                <CircleAlert size={13} aria-hidden="true" />
                <span>{command.warning}</span>
              </p>
            )}
            {command.billingNote && (
              <p className={styles.warning}>
                <Info size={13} aria-hidden="true" />
                <span>{command.billingNote}</span>
              </p>
            )}
            <CommandExample example={command.example} title={command.title} />
            <a
              href={command.sourceUrl}
              className={styles.commandDocs}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('cheatsheets.commandDocs', {
                title: command.title,
              })}
            >
              {t('cheatsheets.docs')}
              <ArrowUpRight size={12} aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
