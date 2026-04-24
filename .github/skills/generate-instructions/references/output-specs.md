# Output Specifications

## `copilot-instructions.md`

**Location:** `.github/copilot-instructions.md`
**Format:** Markdown, no YAML frontmatter needed

### Required Sections (based on template structure)
Adapt section titles to the project, but always cover:

1. **Project Overview** — What the app does, target users, key value
2. **Core Principles** — Engineering values (YAGNI, KISS, DRY, SOLID, etc.)
3. **Tech Stack** — Framework, build tool, styling, state, backend, i18n, routing
4. **Development Guidelines**
   - File Organization & Naming Convention
   - Project Structure (visual tree)
   - Code Quality Standards (TypeScript, React/framework patterns)
   - UI Primitives — list available reusable components; mandate their use over raw HTML
   - State Management approach
   - Styling conventions
   - Backend/API integration pattern
5. **Component Templates** — Minimal code stubs for common patterns:
   - New page / route
   - Custom hook
   - Service / API layer
6. **i18n** — How translations are managed, where keys live
7. **Testing & Quality** — Test runner, what to test, commands
8. **Security Guidelines** — Auth checks, input validation, secrets
9. **Performance Best Practices** — Lazy loading, memoization, etc.
10. **Common Patterns** — Repeated patterns the AI should follow
11. **What NOT to Do** — Anti-patterns as a quick-scan `❌` list
12. **Environment Variables** — Required vars (names only, no values)
13. **Quick Reference** — Run commands, adding a feature checklist

### Tone
- Directive: "Use...", "Always...", "Never..."
- Concise bullets over prose
- Code examples where the pattern is non-obvious

---

## `.cursorrules`

**Location:** `.cursorrules` (project root)
**Format:** Plain markdown — Cursor reads this as free-text context

### Differences from `copilot-instructions.md`
- No GitHub-specific formatting requirements
- Can be slightly shorter (Cursor feeds entire file as context)
- Add a top-level note: `# Cursor Rules for <Project Name>`
- Omit the "Adding a New Feature" checklist (GitHub Copilot chat-specific)
- Keep all conventions, anti-patterns, tech stack, and code examples

### Template Opening

```
# Cursor Rules for <Project Name>

You are an expert developer working on <Project Name>.
Follow these rules precisely when generating or modifying code.

## Tech Stack
...
```

---

## Quality Checks Before Saving

- [ ] No content copied verbatim from template (e.g., "MDM Kiosk", "Angular Material")
- [ ] Sections match actual project tech stack
- [ ] Code stubs compile/are valid for the project's language
- [ ] i18n keys point to actual locale file paths
- [ ] Environment variable names match `.env.example` or `environments/` folder
- [ ] Anti-patterns list is specific to this stack (not generic Angular/React mixed)
- [ ] UI primitives rule included — if project has reusable components (Button, Input, DatePicker, etc.), add a rule to always use them instead of raw HTML elements
