## Dark Palette Refinement QA

### Source and state

- Approved visual targets: `artifacts/themes/refined/reference-midnight-indigo.png` and `artifacts/themes/refined/reference-graphite-teal.png`.
- Actual implementation: `artifacts/themes/refined/midnight-indigo-vi-1440.png` and `artifacts/themes/refined/graphite-teal-vi-1440.png`.
- Source PNGs: 1505 × 1045 pixels. Comparison boards normalize each to 1440 × 1000 CSS pixels; actual captures use 1440 × 1000 at device scale 1.
- Route/state: `/change-case`, Vietnamese UI selected through the existing language control, test input `Xin chào Useful Tools`, theme popover open with the corresponding theme selected, page at scroll top.
- Mobile captures: 390 × 844 CSS pixels at scale 1, both dark themes, same open popover state. The supplied concepts are desktop; mobile retains the existing responsive structure.

### Comparison evidence

- Full views: `artifacts/themes/refined/midnight-indigo-comparison.png` and `artifacts/themes/refined/graphite-teal-comparison.png` place the approved concept and rendered app side by side.
- Focused popover regions: corresponding `*-comparison-detail.png` boards show the same 400 × 430 CSS-pixel region from x=880, y=60, allowing small text, card spacing, selected borders and previews to be inspected.
- Closed popovers and selected/hover states: `artifacts/themes/refined/midnight-indigo-selected-1440.png` and `artifacts/themes/refined/graphite-teal-selected-1440.png`.
- Regression views: all four palettes captured at 1440px and 390px; Settings captured with an isolated local admin fixture. Firebase HTTP/WebSocket connections were blocked, and test text is synthetic.

### Fidelity surfaces

- Fonts/typography: existing Be Vietnam Pro and JetBrains Mono preserved; titles, small labels and wrapping remain consistent. Secondary text and conversion labels now use neutral tones.
- Spacing/layout rhythm: component positions, 252px sidebar, 72px header, card gaps, radii, popover bounds and responsive behavior preserved. No clipping, overlaps or document-level horizontal overflow observed within the captured scope.
- Colors/tokens: neutral charcoal/graphite canvas, quieter chrome, raised card surfaces, darker inset inputs and a separate popover surface match the approved direction. Indigo/teal remain on primary actions, active navigation and selected/focus states. White primary-button text contrast is 4.67:1 (indigo) and 5.07:1 (teal); muted text on the overlay is 6.42:1 and 6.04:1 respectively.
- Image/asset fidelity: no new raster assets are required by this color-only refinement. Existing brand and icon components are retained. Theme thumbnails use the updated palette and chrome color.
- Copy/content: existing product copy preserved. The screenshot input is only a test fixture. Both English and Vietnamese theme controls checked.

### Findings and iteration history

- Earlier [P2]: Change Case's direct textarea still used `bg-elevated`, leaving it visually merged with the card despite the new inset token. The browser hierarchy assertion failed and `artifacts/themes/refined/failure-1440.png` records the pre-fix state.
- Fix: direct textarea and shared Input/TextArea use `bg-inset`; the output well uses the inset surface only in dark mode. Retained the existing light-theme output background.
- Post-fix: the full browser suite passes the surface hierarchy assertions for both dark themes at desktop and mobile. Latest actual captures and comparison boards were opened and inspected; no actionable P0/P1/P2 mismatch remains.
- Accepted constraint: AI reference glow/texture and rasterized glyph irregularities are not reproduced. The existing app keeps crisp text and flat surfaces. The development-only Next.js indicator remains in dev captures.

### Verification and limits

- TypeScript: passed with `--noEmit --incremental false`.
- Playwright: full suite passed, exit 0; exact output in `artifacts/themes/refined/verification.log`.
- Checked: theme changes, selection, reload persistence, keyboard navigation, Escape/Tab dismissal, focus restoration, global search, conversion, system preference changes, cross-tab updates, export and storage failure.
- No runtime/hydration errors in the English regression suite or Vietnamese captures reached through the language switcher. The existing direct-load Vietnamese locale issue remains documented in `docs/theme-palettes.md`.
- Live Firebase account synchronization was not exercised; lint configuration remains unavailable as documented previously.

final result: passed

### Production integration verification

- Release candidate starts from production `origin/main` commit `5252cf476c9d7f986632a9fb3d3307c5fe5b8afb`, preserving the newer Spreadsheet, Spending, Cheatsheets and Firebase changes.
- Applied only the theme patch. The production toolbar retains its existing inline tool search; unrelated GlobalSearch, Calendar and Notes work from the older local checkout is excluded.
- `npm ci`, optimized `npm run build` with type checking, and all nine `test:cheatsheets` cases passed.
- Full theme Playwright suite passed against the optimized server at port 3002, covering four themes at desktop/mobile and all persistence, keyboard, system, cross-tab, export and storage-failure checks.
- Actual release images and exact browser log: `artifacts/themes/release/candidate/`. Inspected both dark desktop/mobile captures and both dark Cheatsheets captures; no new visual defect or runtime error found in the verified scope.
