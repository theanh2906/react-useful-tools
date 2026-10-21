# Theme palettes

Add MagicTools-style palette selection to Useful Tools while preserving the current light appearance and existing work.

## Scope

- Four palettes: Midnight Indigo, Graphite Teal, Cloud Blue, Warm Sand.
- Shared accessible palette cards in the header popover and Settings.
- Apply locally before syncing signed-in settings; guest preferences stay on the device.
- Preserve existing light, dark, and system preferences and version 2 storage.
- Bootstrap the saved palette before first paint, apply across all routes, and follow OS changes for legacy system preferences.
- Keep existing layout, features, and dependencies.

## Verification

- TypeScript check, independent code review, and real Playwright browser checks.
- Desktop/mobile coverage for all four palettes, keyboard navigation, dismissal, persistence, legacy preferences, and public routes.
- Inspect real screenshots before sharing for user review.
- Account settings UI may use a clearly identified isolated browser fixture. Do not write to a live database during UI testing.

## Repository notes

The workflow files referenced by AGENTS.md are absent from this checkout. Existing unrelated calendar, notes, and global-search work is preserved.

## Result

Implemented and reviewed. TypeScript and the full Playwright theme suite pass; actual desktop/mobile and Settings captures inspected. See `docs/theme-palettes.md` for behavior, reproduction commands, related fixes, and verification limits. Ready for user visual review; no deployment or release packaging performed.
