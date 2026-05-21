# ⚡ Automations Directory

Automations are background scripts, event listener hooks, or cron jobs that trigger tasks based on time schedules or system events.

## 📁 Component Structure

Each automation should reside in its own subdirectory and contain:

1.  **`automation.yaml`**: Event trigger type (e.g. `cron`, `webhook`, `file_change`), frequency, and target action.
2.  **`handler.sh`** or **`main.py`**: Script to be executed when triggered.
3.  **`README.md`**: Guide on how to start, schedule, and maintain this automation.

## 📝 Example `automation.yaml`

```yaml
name: "daily-journal-summarizer"
version: "1.0.0"
description: "Scan local diary folders every night at 11 PM and generate a summary using an LLM."
trigger:
  type: "cron"
  schedule: "0 23 * * *"
action:
  type: "run-workflow"
  workflow: "summarize-notes"
```
