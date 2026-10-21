# Theme palettes

Useful Tools supports Midnight Indigo, Graphite Teal, Cloud Blue, and Warm Sand. The toolbar palette button and Settings use the same accessible radio choices, with previews and selected-state indicators. Cloud Blue preserves the previous light appearance.

## Refined dark palettes

The approved dark concepts use neutral surfaces with restrained indigo or teal accents. Separate `chrome`, `overlay`, and `inset` tokens distinguish navigation, popovers, and inputs from cards; each falls back to the existing elevated color in light themes.

| Theme | Canvas | Navigation | Card | Input | Popover | Primary action |
| --- | --- | --- | --- | --- | --- | --- |
| Midnight Indigo | `#101218` | `#151820` | `#1b1e27` | `#14171e` | `#20232d` | `#6366df` |
| Graphite Teal | `#131616` | `#181c1c` | `#202525` | `#171b1b` | `#242a2a` | `#257b70` |

Secondary text, borders, and conversion labels are desaturated. Existing light palette values and interactions are preserved. Latest actual screenshots, approved references, comparison boards and the full passing browser log are in `artifacts/themes/refined/`; the scoped comparison review is in `docs/theme-palettes-qa.md`.

## Behavior

- Semantic surfaces and primary/accent scales use CSS variables. Status colors retain their existing meaning.
- Changes apply immediately and persist through the existing version 2 `app-storage` store. Signed-in Firebase settings sync afterward; guests only save locally.
- Existing `light` and `dark` values map to Cloud Blue and Midnight Indigo. Existing `system` preferences continue following OS changes.
- A head script restores the saved palette before first paint. A root-level provider keeps auth and public sharing routes themed, handles OS changes, and rehydrates theme changes from other tabs.
- Settings mutations and JSON exports use the current app theme so another tab cannot leave a stale theme in the exported or saved settings.
- If persistence throws, the chosen theme still applies and an error toast explains that saving failed.
- Arrow keys, Home, and End select palettes. Escape closes the popover and returns focus. Tab and Shift+Tab resume toolbar tab order; clicking or focusing outside closes it.

## Related fixes

- Profile/settings subscriptions wait until Firebase auth initialization and dispose late subscriptions during cleanup.
- Completed global loading overlays unmount immediately. An interrupted Framer exit animation previously left a transparent overlay intercepting clicks in Settings; this was reproduced in Playwright before the fix.

## Verification

```powershell
node node_modules/typescript/bin/tsc --noEmit --incremental false
$env:PLAYWRIGHT_MODULE = 'C:\Users\anh.tang\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright'
node scripts\verify-themes.cjs
```

Both passed. Playwright covers all four palettes at 1440×1000 and 390×844, computed backgrounds and dark classes, selection, persistence/reload, keyboard/dismissal/focus, bounds/no overflow, text conversion, global search shortcut, auth routes, legacy/system/invalid preferences, cross-tab updates, JSON export, and failed storage writes.

Real screenshots are in ignored `artifacts/themes/`; they were captured after entrance animations settled and visually inspected. Additional Vietnamese toolbar captures were verified by switching language through the existing UI. Settings uses an isolated local admin fixture, with Firebase HTTP and WebSocket connections blocked. Live account synchronization has not been exercised against a real Firebase account.

`npm run lint` stops at Next.js's interactive ESLint setup prompt because this checkout has no ESLint configuration. No lint configuration or dependencies were added.

## Existing limitation outside this change

A direct first load with a Vietnamese browser locale can produce an i18n hydration mismatch in the unchanged sidebar (`Main` versus `Chính`). This is separate from theme restoration; Vietnamese screenshots and theme interaction were verified after changing language through the UI. Initial locale hydration remains unresolved.
