# 🔗 Workflows Directory

Workflows are multi-step AI orchestrations connecting multiple agents, skills, and conditional routing logic.

## 📁 Component Structure

Each workflow should reside in its own subdirectory and contain:

1.  **`workflow.yaml`**: Workflow structure definition, steps description, and orchestrator config.
2.  **`graph.json`** or **`pipeline.py`**: Flow execution definition (e.g. LangGraph structure, n8n flow, or custom pipeline logic).
3.  **`README.md`**: Guide on running, configuring, and deploying this workflow.

## 📝 Example `workflow.yaml`

```yaml
name: "pr-review-pipeline"
version: "1.0.0"
description: "Fetch PR changes, analyze with Code Reviewer Agent, and post comments."
trigger: "github_pull_request_opened"
steps:
  - name: "fetch-diff"
    skill: "git-fetch-diff"
  - name: "review"
    agent: "code-reviewer"
    input:
      diff: "{{steps.fetch-diff.output}}"
  - name: "post-comment"
    skill: "github-post-comment"
    input:
      comment: "{{steps.review.output}}"
```
