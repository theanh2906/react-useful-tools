# CLI Cheatsheets verification

Expansion reviewed on 2026-10-04, continuing the `feature/cli-cheatsheets` preview from commit `ab92eb5d075f96357aa0b29dba9e6134fa97bc19`. The original feature was based on main commit `7ac61940520344f372e6d737d8a87df362e0f11a`.

## Delivered behavior

- Public `/cheatsheets` route integrated into the existing sidebar and global tool search
- 1,159 reference entries: gh 205, TWG 691, Git 263 recipes covering 171 documented entry points
- Full, version-bound inventories with explicit exclusions and a 5-alias TWG mapping
- 48-entry pagination and Show all; searches include off-page commands and key-option definitions
- Keyboard tool tabs, combined topic/search filtering, empty/reset state, and focus restoration
- Full topic selector for large inventories; advanced/plumbing labels and expandable option definitions
- Exact copy feedback, repeated copy, clipboard-denied help and successful retry
- Visible destructive/data-change warnings, TWG credit notes, preview labels and 29 explicit runtime/ID template notices
- English/Vietnamese interface labels; primarily Vietnamese explanations and exact technical identifiers
- No editing, saving, execution UI, backend, or new runtime dependency

## Verified checks

- `npm run test:cheatsheets`: 7 data, search, pagination and exact-inventory regression tests
- `tsc --noEmit --incremental false`
- Explicit-config ESLint with `next/core-web-vitals` and `next/typescript` for all changed TypeScript source files
- `git diff --check`
- Production build with statically generated `/cheatsheets`
- Source-specific example/flag validation and pinned coverage manifests; no actual example commands executed

A temporary JSDOM harness exercised the actual React components with CSS mocked and clipboard writes stubbed. It checked paging, off-page search, Show all, all-topic selection, option disclosure, advanced labels, reset/focus, copy/retry, keyboard tabs, template notices and language labels. A separate 600-entry fixture stress test checked page boundaries and complete-data search. These are DOM interaction tests, not visual-browser or real clipboard verification.

The original category text/tint contrast audit passed WCAG AA (4.80–5.80:1); the expanded interface preserves those colors and explicit focus indicators.

## Verification limits

- The repository has no committed ESLint config. `npm run lint` starts first-time interactive setup, so targeted lint used an explicit temporary configuration rather than claiming a full-repository lint pass.
- No screenshots or new visual-browser QA were requested for the expansion. Earlier local browser attempts were blocked by the execution environment; no restrictions were bypassed. Responsive CSS and real-browser clipboard behavior are not claimed as visually verified.
- TWG's 29 templates require actual IDs or runtime schema. Compatibility checks are based on official source contracts, not on the user's installed CLI versions or tenant permissions.

Publication continues only on the dedicated feature branch and its Vercel preview. No main-branch merge or production promotion is part of this work.

## Row layout refinement — 2026-10-05

- All topics renders every topic with up to four entries and a Show more button where additional entries exist
- Show more selects the corresponding topic, resets pagination and Show all, then focuses and scrolls the results region
- Groups and commands use row-based layouts; command information and examples sit side by side on desktop and stack below 768px
- Full-inventory search, topic pagination/Show all, reference content, theme colors, safety notices, and clipboard behavior are preserved
- `npm run test:cheatsheets`: 9/9 tests, including new preview and hidden-entry search coverage
- TypeScript, scoped Next.js ESLint, whitespace checks, and production build passed
- A temporary JSDOM harness exercised the actual components for all three tools: every topic/count, four-entry limits, Show more target and accessible name, page/Show all resets, focus and scroll requests, hidden-entry search, broad search pagination, whitespace queries, reset focus, copy text, option disclosure, and Vietnamese labels
- Original screenshot inspected as design reference. New browser geometry, real clipboard behavior, and visual appearance remain unverified; prior environment browser restrictions were not bypassed
