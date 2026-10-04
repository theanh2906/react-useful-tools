# Cheatsheets content verification

Verified on 2026-10-04 against official primary documentation. This is static reference content; no commands were executed against a user's repository, GitHub account, or Atlassian tenant.

## Dataset

- `git.json`, `gh.json`, `twg.json`: independently reusable tool records
- `cheatsheets.ts`: typed combined data, ordered `gh`, `twg`, `git`
- Risk values describe the command example: `read`, `write`, or `destructive`
- `warning` is visible advice, including preparation and consequences
- `billingNote` identifies TWG Enriched commands requiring Rovo Credits
- Titles and descriptions are original Vietnamese explanations; command syntax follows upstream documentation
- IDs, domains and branches in examples are illustrative and should be replaced deliberately
- The interface must only display and copy commands; it must not execute them

## TWG identity and version

The intended tool is Atlassian Teamwork Graph CLI, executable `twg`, not an unrelated npm package.

- Official public repo: https://github.com/atlassian/twg-cli
- Stable manifest: https://teamwork-graph.atlassian.com/cli/manifest.json
- Manifest checked: stable `1.3.3`, build commit `32ee314125ea`, published `2026-09-28T13:09:31Z`
- Official docs mirror: https://atlassian.github.io/twg-cli/
- Catalog and guide snapshot: generated from public repo commit `56b9b3472458`, `2026-10-02T09:34:03+00:00`
- Changelog identifies `1.3.5` as beta only: https://atlassian.github.io/twg-cli/changelog/

## TWG documentation drift

Current installation, troubleshooting, and command catalog pages document `twg upgrade`. Some Atlassian Support documentation and the stable manifest's older update-policy message still say `twg update`. The cheatsheet uses the current documented `upgrade` form and advises checking installed command help rather than asserting that `update` is absent or an alias.

The beta 1.3.5 changelog removes `twg api`; this cheatsheet avoids raw API recipes so it does not embed that version-specific incompatibility. It uses single-page Confluence examples because batching support has also changed across releases.

Public reference skills provide documented command shapes and semantic caveats:
- https://github.com/atlassian/twg-cli/blob/main/skills/twg/SKILL.md
- https://github.com/atlassian/twg-cli/blob/main/skills/twg-jira/SKILL.md
- https://github.com/atlassian/twg-cli/blob/main/skills/twg-jira/references/workitems.md
- https://github.com/atlassian/twg-cli/blob/main/skills/twg-jira/references/querying.md
- https://github.com/atlassian/twg-cli/blob/main/skills/twg-confluence/SKILL.md
- https://github.com/atlassian/twg-cli/blob/main/skills/twg-confluence/references/content.md

## Important interpretation details

- TWG `jira workitem transition` without `--transition-id` is a read-only discovery call; adding a transition target changes state
- `docs query` is activity lookup; `docs search` is topic/content discovery
- `work query` default activity is authored work during seven days, not a complete open-ticket queue
- Rovo search exit code 3 indicates incomplete coverage, not no matching content
- TWG uninstall copy example retains `--dry-run`; its warning explains what happens without it
- TWG login and setup are marked writes because they persist configuration/authentication and may install skills or enable upkeep
- `risk: read` does not mean free: TWG Enriched reads can consume Rovo Credits

No live installed CLI compatibility was claimed. The installed command's own help is authoritative if the user's local release differs.
