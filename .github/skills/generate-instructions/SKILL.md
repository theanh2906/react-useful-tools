---
name: generate-instructions
description: "Generate copilot-instructions.md and .cursorrules files for any project. Use when setting up AI coding guidelines, creating GitHub Copilot workspace instructions, generating Cursor IDE rules, or establishing code-generation conventions for a new or existing codebase. Analyzes tech stack, architecture patterns, file naming, styling approach, state management, and team conventions to produce tailored, structured instruction files."
argument-hint: "Optional: project path, tech stack details, or specific areas to focus on"
---

# Generate Instructions Skill

Generates `copilot-instructions.md` and `.cursorrules` from codebase analysis.

## Procedure

### 1. Load Template
Read the structural template: `references/copilot-instructions-template.md`
Use it as a guide for which **sections** to include — not the content itself.

### 2. Analyze Project
See [analysis-guide.md](./references/analysis-guide.md) for what to inspect.

### 3. Clarify Gaps
Use `vscode_askQuestions` to fill any missing context before generating.

### 4. Generate Files
Follow [output-specs.md](./references/output-specs.md) for format rules.

Generate both:
- `.github/copilot-instructions.md` — GitHub Copilot workspace instructions
- `.cursorrules` — Cursor IDE rules (root of project)

### 5. Validate
- Re-read both files after writing
- Confirm sections map to the template structure
- Check no hardcoded project names bleed through from template
