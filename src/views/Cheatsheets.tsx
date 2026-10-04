'use client';

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Code2,
  Command,
  GitBranch,
  Github,
  Info,
  Search,
  Terminal,
  X,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cheatsheets } from '@/data/cheatsheets';
import { filterCheatsheetGroups } from '@/lib/cheatsheets';
import CommandGroup from '@/components/cheatsheets/CommandGroup';
import { ShellCommand } from '@/components/cheatsheets/CommandExample';
import styles from '@/components/cheatsheets/cheatsheets.module.css';

const toolOrder = ['gh', 'twg', 'git'] as const;
const toolIcons = { gh: Github, twg: Command, git: GitBranch };
const toolNames = { gh: 'GitHub CLI', twg: 'Teamwork Graph', git: 'Git' };

export default function Cheatsheets() {
  const { t } = useTranslation();
  const [activeTool, setActiveTool] =
    useState<(typeof toolOrder)[number]>('gh');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const toolRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sheets = toolOrder
    .map((id) => cheatsheets.find((sheet) => sheet.id === id))
    .filter((sheet) => sheet !== undefined);
  const sheet = sheets.find((item) => item.id === activeTool)!;
  const filteredGroups = useMemo(
    () => filterCheatsheetGroups(sheet?.groups ?? [], query, category),
    [sheet, query, category]
  );
  const searchGroups = useMemo(
    () => filterCheatsheetGroups(sheet?.groups ?? [], query),
    [sheet, query]
  );
  const count = filteredGroups.reduce(
    (total, group) => total + group.commands.length,
    0
  );
  const totalCount =
    sheet?.groups.reduce((total, group) => total + group.commands.length, 0) ??
    0;
  const allCount = sheets.reduce(
    (total, item) =>
      total +
      item.groups.reduce((sum, group) => sum + group.commands.length, 0),
    0
  );
  const heroExample = sheet?.groups
    .flatMap((group) => group.commands)
    .find((command) => command.risk === 'read');

  const selectTool = (id: (typeof toolOrder)[number]) => {
    setActiveTool(id);
    setCategory('all');
  };
  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    searchRef.current?.focus();
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Code2 size={14} aria-hidden="true" />
        <span>{t('categories.development')}</span>
        <ChevronRight size={13} aria-hidden="true" />
        <span>{t('navigation.cheatsheets')}</span>
      </div>

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span />
            {t('cheatsheets.eyebrow')}
          </p>
          <h1>
            Cheatsheets<span>.</span>
          </h1>
          <p className={styles.subtitle}>{t('cheatsheets.subtitle')}</p>
          <div className={styles.heroMeta}>
            <span>
              <BookOpen size={14} aria-hidden="true" />
              {t('cheatsheets.toolsCount', { count: sheets.length })}
            </span>
            <span>{t('cheatsheets.examplesCount', { count: allCount })}</span>
            <span className={styles.readOnly}>{t('cheatsheets.readOnly')}</span>
          </div>
        </div>
        <div className={styles.terminal} aria-hidden="true">
          <div className={styles.terminalHeader}>
            <span className={styles.terminalDots}>
              <i />
              <i />
              <i />
            </span>
            <span>quick-reference.sh</span>
            <Terminal size={13} />
          </div>
          <div className={styles.terminalBody}>
            <span className={styles.terminalComment}>
              # {t('cheatsheets.terminalNote')}
            </span>
            <pre>
              <span className={styles.terminalPrompt}>❯ </span>
              <ShellCommand command={heroExample?.example ?? 'gh --help'} />
            </pre>
            <div className={styles.terminalStatus}>
              <span />
              <span>{t('cheatsheets.ready')}</span>
              <span className={styles.terminalCursor}>▍</span>
            </div>
          </div>
        </div>
      </header>

      <div
        className={styles.toolTabs}
        role="tablist"
        aria-label={t('cheatsheets.selectTool')}
      >
        {sheets.map((item, index) => {
          const Icon = toolIcons[item.id];
          const active = item.id === activeTool;
          const commandCount = item.groups.reduce(
            (sum, group) => sum + group.commands.length,
            0
          );
          return (
            <button
              key={item.id}
              ref={(element) => {
                toolRefs.current[index] = element;
              }}
              id={`tool-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="cheatsheet-panel"
              tabIndex={active ? 0 : -1}
              data-tool={item.id}
              className={`${styles.toolTab} ${active ? styles.toolActive : ''}`}
              onClick={() => selectTool(item.id)}
              onKeyDown={(event) => {
                let next = index;
                if (event.key === 'ArrowRight')
                  next = (index + 1) % sheets.length;
                else if (event.key === 'ArrowLeft')
                  next = (index - 1 + sheets.length) % sheets.length;
                else if (event.key === 'Home') next = 0;
                else if (event.key === 'End') next = sheets.length - 1;
                else return;
                event.preventDefault();
                selectTool(sheets[next].id);
                toolRefs.current[next]?.focus();
              }}
            >
              <span className={styles.toolIcon}>
                <Icon size={23} aria-hidden="true" />
              </span>
              <span className={styles.toolText}>
                <strong>{item.id}</strong>
                <span>{toolNames[item.id]}</span>
              </span>
              <span className={styles.toolCount}>
                {commandCount}
                <span>{t('cheatsheets.commands')}</span>
              </span>
              <ArrowRight
                className={styles.toolArrow}
                size={17}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {sheet && (
        <section
          id="cheatsheet-panel"
          role="tabpanel"
          aria-labelledby={`tool-tab-${activeTool}`}
          className={styles.panel}
          tabIndex={0}
        >
          <div className={styles.toolbar}>
            <div className={styles.sectionIntro}>
              <span className={styles.sectionMark} data-tool={activeTool}>
                {activeTool}
              </span>
              <div>
                <h2>{sheet.title}</h2>
                <p>{sheet.description}</p>
              </div>
            </div>
            <div className={styles.search}>
              <Search size={17} aria-hidden="true" />
              <input
                ref={searchRef}
                id="cheatsheet-search"
                type="search"
                value={query}
                placeholder={t('cheatsheets.searchPlaceholder')}
                aria-label={t('cheatsheets.searchLabel', {
                  tool: toolNames[activeTool],
                })}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setQuery('');
                    event.stopPropagation();
                  }
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    searchRef.current?.focus();
                  }}
                  aria-label={t('cheatsheets.clearSearch')}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          <div
            className={styles.categories}
            role="group"
            aria-label={t('cheatsheets.categories')}
          >
            <button
              type="button"
              onClick={() => setCategory('all')}
              aria-pressed={category === 'all'}
              className={category === 'all' ? styles.categoryActive : ''}
            >
              {t('cheatsheets.allTopics')}
              <span>
                {searchGroups.reduce(
                  (sum, group) => sum + group.commands.length,
                  0
                )}
              </span>
            </button>
            {sheet.groups.map((group, index) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setCategory(group.id)}
                aria-pressed={category === group.id}
                className={category === group.id ? styles.categoryActive : ''}
              >
                <i className={styles.categoryDot} data-color={index % 6} />
                {group.title}
              </button>
            ))}
          </div>

          <div className={styles.boardMeta}>
            <span role="status" aria-live="polite">
              {t('cheatsheets.showing', { count, total: totalCount })}
            </span>
            {query || category !== 'all' ? (
              <button type="button" onClick={clearFilters}>
                {t('cheatsheets.resetFilters')}
                <X size={12} />
              </button>
            ) : (
              <span>{t('cheatsheets.exampleHint')}</span>
            )}
          </div>

          {filteredGroups.length > 0 ? (
            <div className={styles.board}>
              {filteredGroups.map((group) => (
                <CommandGroup
                  key={`${activeTool}-${group.id}`}
                  group={group}
                  tool={activeTool}
                  index={sheet.groups.findIndex((item) => item.id === group.id)}
                />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <Search size={30} aria-hidden="true" />
              <h3>{t('cheatsheets.noResults')}</h3>
              <p>
                {t('cheatsheets.noResultsHint', {
                  tool: toolNames[activeTool],
                })}
              </p>
              <button type="button" onClick={clearFilters}>
                {t('cheatsheets.resetFilters')}
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          <footer className={styles.footer}>
            <div className={styles.referenceNote}>
              <Info size={17} aria-hidden="true" />
              <p>{t('cheatsheets.referenceNote')}</p>
            </div>
            <details className={styles.sources}>
              <summary>
                <BookOpen size={15} aria-hidden="true" />
                {t('cheatsheets.sources')}
                <span>{sheet.verifiedAt}</span>
              </summary>
              <div className={styles.sourceBody}>
                <p>{sheet.versionNote}</p>
                {sheet.billingNote && <p>{sheet.billingNote}</p>}
                <div>
                  {sheet.sources.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.title}
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </details>
          </footer>
        </section>
      )}
    </div>
  );
}
