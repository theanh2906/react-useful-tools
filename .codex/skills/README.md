# 🛠️ Skills Directory

Skills are executable tools, APIs, or scripts that agents can use to interact with the external world (e.g. read files, run search queries, execute calculations).

## 📁 Component Structure

Each skill should reside in its own subdirectory and contain:

1.  **`skill.md`**: The skill definition containing YAML frontmatter at the top (enclosed in `---` lines) representing its configuration parameters and metadata, followed by detailed usage instructions and markdown documentation.
2.  **`main.py`** or **`index.js`**: The main executable script.

## 📝 Example `skill.md`

```markdown
---
name: "web-search"
version: "1.0.0"
description: "Perform Google search queries and return aggregated text results."
runtime: "python3"
entrypoint: "main.py"
parameters:
  properties:
    query:
      type: "string"
      description: "The search query to look up on the web"
    max_results:
      type: "integer"
      description: "Maximum number of search results to return"
      default: 5
  required:
    - query
---

# 🛠️ Skill: web-search

## Description
This skill performs web queries to Google and returns aggregated text snippets.
```
