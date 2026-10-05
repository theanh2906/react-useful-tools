import { ArrowRight, ArrowUpRight, CircleAlert, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CheatsheetGroup } from '@/data/cheatsheets';
import CommandExample from './CommandExample';
import styles from './cheatsheets.module.css';

export default function CommandGroup({
  group,
  index,
  tool,
  totalCommands,
  onShowMore,
}: {
  group: CheatsheetGroup;
  index: number;
  tool: string;
  totalCommands: number;
  onShowMore?: (groupId: string) => void;
}) {
  const { t } = useTranslation();
  const headingId = `${tool}-${group.id}-heading`;
  const showMoreLabel = t('cheatsheets.showMore', {
    count: totalCommands - group.commands.length,
  });

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
        <span className={styles.groupCount}>
          {group.commands.length === totalCommands
            ? totalCommands
            : `${group.commands.length}/${totalCommands}`}
        </span>
      </header>
      {group.level && group.level !== 'core' && (
        <p className={styles.groupLevel}>
          {t(`cheatsheets.level.${group.level}`)}
        </p>
      )}
      <div className={styles.groupCommands}>
        {group.commands.map((command) => (
          <article key={command.id} className={styles.command}>
            <div className={styles.commandInfo}>
              <div className={styles.commandTitle}>
                <h4>{command.title}</h4>
                {command.risk !== 'read' && (
                  <span className={styles.risk} data-risk={command.risk}>
                    {t(`cheatsheets.risk.${command.risk}`)}
                  </span>
                )}
              </div>
              {command.status && (
                <span className={styles.commandStatus}>
                  {t(`cheatsheets.commandStatus.${command.status}`)}
                </span>
              )}
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
            </div>
            <div className={styles.commandDetails}>
              {command.exampleKind && command.exampleKind !== 'usage' && (
                <p className={styles.discoveryLabel}>
                  <Info size={13} aria-hidden="true" />
                  {t(
                    command.exampleKind === 'template'
                      ? 'cheatsheets.templateExample'
                      : 'cheatsheets.discoveryExample'
                  )}
                </p>
              )}
              <CommandExample
                example={command.example}
                title={command.title}
                kind={command.exampleKind}
              />
              {command.options && command.options.length > 0 && (
                <details className={styles.commandOptions}>
                  <summary>
                    {t('cheatsheets.importantOptions', {
                      count: command.options.length,
                    })}
                  </summary>
                  <dl>
                    {command.options.map((option, optionIndex) => (
                      <div key={`${option.flag}-${optionIndex}`}>
                        <dt>
                          <code>{option.flag}</code>
                        </dt>
                        <dd>
                          {option.description}
                          {option.example && (
                            <code className={styles.optionExample}>
                              {option.example}
                            </code>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </details>
              )}
            </div>
          </article>
        ))}
      </div>
      {onShowMore && group.commands.length < totalCommands && (
        <footer className={styles.groupFooter}>
          <button
            type="button"
            onClick={() => onShowMore(group.id)}
            aria-label={`${showMoreLabel}: ${t('cheatsheets.showTopic', {
              title: group.title,
              count: totalCommands,
            })}`}
          >
            {showMoreLabel}
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </footer>
      )}
    </section>
  );
}
