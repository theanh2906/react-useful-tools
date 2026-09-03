# Spreadsheet Manager Design QA

**Source visual truth path**

`/workspace/scratch/fedf4820cc2e/generated_images/exec-4cabebd8-0b5e-4094-a8a8-d11d21b26a05.png`

**Implementation screenshot path**

`/tmp/spreadsheet-manager-preview-top.png` in the cloud-browser runtime.

**Viewport and normalization**

- Source pixels: 852 × 1876; intended mobile CSS viewport: 426 × 938 at density 2.
- Implementation capture: 1365 × 936 desktop viewport at browser density 1.
- No density normalization was applied because the current browser surface could not switch to the source viewport.

**State**

- Source: mobile hub with an expanded Google Sheet, collapsed Google/Excel cards, tabs, and recent records.
- Implementation: desktop fallback state with one stored Excel URL. This is a real production-preview state created through the UI.

**Full-view comparison evidence**

- The shared coral primary CTA, bold heading hierarchy, bordered file cards, source icon, warning badge, restrained blue accent, and generous white-space rhythm carry through to the existing product shell.
- The desktop implementation intentionally uses the product's sidebar/header rather than the source's mobile bottom navigation.
- Production preview rendered the route and fallback card without clipping or overlap.

**Focused region comparison evidence**

- Add modal: opened from the header CTA; the URL field was addressable by its visible label and the submit button enabled only after input.
- Excel fallback: submitting `BBT-mau.xlsx` closed the modal, persisted a file card, and showed the intended read-only warning toast/badge.
- Console: no application-origin errors; observed errors came only from the cloud-browser extension.

**Findings**

- [P1] Native Google Sheets flow remains unverified
  - Location: OAuth → metadata → sheet tabs → append record.
  - Evidence: the supplied workbook is an Office `.xlsx`, and the user elected to upload/convert it manually.
  - Impact: the core write path cannot be certified until tested with the resulting native Google Sheets URL.
  - Fix: add the converted URL, authorize Google, switch tabs, and append a disposable test row.
- [P2] Mobile viewport comparison remains unavailable
  - Location: `/spreadsheets` responsive layout.
  - Evidence: the available cloud browser captured only the 1365 × 936 desktop viewport while the source is 426 × 938 CSS pixels.
  - Impact: exact mobile spacing and bottom-navigation fidelity are not certified.
  - Fix: repeat the visual pass at 426 × 938.

**Open Questions**

- Confirm whether production Firebase OAuth already allows the preview and production Vercel domains.

**Implementation Checklist**

- Test the native Google Sheets URL through OAuth, tab switching, refresh, and append-row.
- Capture the route at 426 × 938 and compare against the source.
- Promote only after those two checks pass.

**Comparison History**

- Pass 1: local preview URL was blocked by cloud-browser policy; no rendered evidence.
- Pass 2: Git-backed Vercel preview reached `READY`; route, modal, fallback submission, persistence UI, and console were checked. Native Sheets and same-viewport mobile checks remain.

**Follow-up Polish**

- Revisit exact mobile density after a same-viewport capture; no desktop P3 issue observed.

final result: blocked
