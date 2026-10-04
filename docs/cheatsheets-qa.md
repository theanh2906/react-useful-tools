# CLI Cheatsheets verification

Local implementation reviewed on 2026-10-04, based on main commit `7ac61940520344f372e6d737d8a87df362e0f11a`.

## Delivered behavior

- Public `/cheatsheets` route integrated into the existing sidebar and global tool search
- Read-only reference with 90 commands, 30 each for `gh`, `twg`, and `git`, across 21 topic groups
- Tool tabs support Arrow Left/Right, Home, and End; topic filters combine with accent-insensitive, all-words search
- Each command has syntax, a Vietnamese explanation, a practical copyable example, and an official source
- Visible data-change/destructive warnings and TWG Rovo Credits notices
- English and Vietnamese interface labels; reference explanations are Vietnamese
- Responsive color-coded reference board, shell-style highlighting, light/dark styles, empty state, copy feedback and copy-error fallback
- No editor, save interface, command execution, backend, or new runtime dependency

## Passed

- `npm run test:cheatsheets`: 5 data/search regression tests
- `tsc --noEmit --incremental false`
- Explicit-config ESLint (`next/core-web-vitals` and `next/typescript`) for all new or changed TypeScript source files
- `git diff --check`
- `npm run build`: production build completed, including statically rendered `/cheatsheets` (17.6 kB route; 122 kB first-load JavaScript)
- Independent source and static-code review; all six light-mode category text/tint contrast ratios pass WCAG AA, from 4.80 to 5.80:1

A temporary JSDOM harness exercised the actual React components with CSS mocked and clipboard writes stubbed. Nine checks passed: initial render and all tools' example counts, accent-insensitive search, empty state/reset/focus, exact and repeated copy text, clipboard denial and retry, category+search composition, keyboard tool selection/focus, Escape clearing, and interface language switching. This is DOM interaction verification, not a real-browser visual or clipboard test.

## Verification limits

- The repository has no committed ESLint config. `npm run lint` starts first-time interactive setup; it was not treated as a passing full-repository lint check. Targeted lint used an explicit temporary configuration without changing repository lint setup.
- Browser rendering, real clipboard behavior, responsive layout, and theme screenshots could not be verified in this execution environment. The cloud browser rejected the local preview with `net::ERR_BLOCKED_BY_CLIENT`. A local Chromium test run, including the reviewed escalation attempt, failed before launch because the environment prohibited a required Unix socket. No restrictions were bypassed.
- No commands from the cheatsheets were executed against GitHub, Atlassian, or a user repository. Compatibility is based on the official references and version notes, not on the user's installed CLIs.

## Recommended browser check before publication

1. Run the app and open `/cheatsheets` at desktop and 390px/320px viewport widths, in both themes. Check readability, focus indicators, and horizontal overflow.
2. Switch all three tools by mouse and keyboard. Search `dang nhap`, combine a category with search, and test an unmatched search and reset.
3. Copy a harmless `gh auth status` example into a plain text editor without executing it. Check repeated copy and clipboard-denied feedback.
4. Confirm sidebar/global tool search navigation and mobile menu dismissal still work.

No publication, push, PR, merge, or deployment was performed.
