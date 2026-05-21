---
name: "feature-suggest"
version: "1.0.0"
description: "Scan project codebase, perform web research, and generate innovative feature recommendations."
runtime: "python3"
entrypoint: "main.py"
parameters:
  properties:
    project_path:
      type: "string"
      description: "Absolute path of the target project to analyze (defaults to workspace directory)"
    focus_areas:
      type: "string"
      description: "Optional specific areas of focus or constraints for suggestions"
    gemini_api_key:
      type: "string"
      description: "Optional Gemini API key (otherwise checks GEMINI_API_KEY environment variable or local .env)"
    openai_api_key:
      type: "string"
      description: "Optional OpenAI API key (otherwise checks OPENAI_API_KEY environment variable or local .env)"
    model:
      type: "string"
      description: "Optional LLM model override (defaults to gemini-1.5-flash or gpt-4o-mini)"
    search_query:
      type: "string"
      description: "Optional custom search query to execute on the web instead of auto-generating from scanning"
  required: []
---

# 🛠️ Skill: feature-suggest

## Description
`feature-suggest` is an advanced project-scanning and innovation skill. It is designed to inspect a codebase, automatically determine its tech stack and structure, read key configurations and entrypoint code files to extract the underlying business logic, execute targeted web research on current industry trends, and run AI-based reasoning to generate actionable, creative feature recommendations tailored to the product.

---

## Inputs

The skill accepts configuration arguments as a JSON object on `stdin`.

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `project_path` | `string` | No | Absolute path to the codebase to analyze. Defaults to the current working directory. |
| `focus_areas` | `string` | No | Optional constraints or key target domains to focus recommendations on (e.g. "security", "collaboration"). |
| `gemini_api_key` | `string` | No | Optional Gemini API key. Overrides environment variable `GEMINI_API_KEY` and `.env` settings. |
| `openai_api_key` | `string` | No | Optional OpenAI API key. Overrides environment variable `OPENAI_API_KEY` and `.env` settings. |
| `model` | `string` | No | Optional LLM model override (defaults to `gemini-1.5-flash` or `gpt-4o-mini`). |
| `search_query` | `string` | No | Optional custom search query to execute on DuckDuckGo Lite instead of auto-generating from codebase keywords. |

---

## Outputs

The skill outputs a JSON object to `stdout` containing the following structure:

```json
{
  "status": "success",
  "project_summary": {
    "tech_stack": ["Go (Golang)", "Node.js"],
    "file_count": 42
  },
  "web_research": [
    {
      "url": "https://example.com/trends",
      "title": "Modern API trends",
      "snippet": "Trending API concepts in 2026..."
    }
  ],
  "suggested_features": [
    {
      "title": "Interactive Real-time Logger",
      "description": "Expose logs via local WebSockets.",
      "rationale": "High-value dashboard functionality...",
      "technical_feasibility": "Create ws handler inside server.go.",
      "creativity_score": "8/10 - Excellent utility"
    }
  ],
  "markdown_report": "# 🚀 Premium Feature Recommendation Report\n..."
}
```

---

## How to Run

### Local Execution (Direct Python command)

You can run the skill manually from your terminal using Python:

```bash
# 1. Create a JSON file (e.g., input.json) with your parameters:
# {
#   "project_path": "C:/Personal/go-project",
#   "focus_areas": "offline synchronization, security"
# }

# 2. Run the command:
python skills/feature-suggest/main.py < input.json
```

Or pass variables directly using shell echo:

```bash
echo '{"project_path": "C:/Personal/AgentHub"}' | python skills/feature-suggest/main.py
```
