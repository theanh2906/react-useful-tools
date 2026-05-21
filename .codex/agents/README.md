# 🤖 Agents Directory

This directory contains configuration, prompts, and metadata files for your personal AI Agents.

## 📁 Component Structure

Each agent should reside in its own subdirectory and contain:

1.  **`agent.yaml`**: The agent manifest file containing metadata, model definitions, and system prompts.
2.  **`prompts/`**: (Optional) Directory containing markdown files for system prompts or instruction templates.
3.  **`README.md`**: Guide on what this agent does, its capability, and instructions on how to invoke it.

## 📝 Example `agent.yaml`

```yaml
name: "code-reviewer"
version: "1.0.0"
description: "An agent that performs automated code reviews on pull requests."
model: "gemini-1.5-pro"
temperature: 0.2
system_instruction: |
  You are an expert software engineer. Review the provided code diff for bugs,
  security issues, performance bottlenecks, and style guides compliance.
skills:
  - "git-diff-viewer"
  - "file-reader"
```
