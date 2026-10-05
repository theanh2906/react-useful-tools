# Full CLI cheatsheets: coverage and sources

Verified on 2026-10-04. The page displays reference text and copies examples; it never executes CLI commands.

## What “full” means

Coverage is tied to a declared public inventory and documented version, rather than an arbitrary entry limit. It does not mean every possible flag combination, user alias, external extension, or site-specific payload can be enumerated.

The dataset contains **1,159 reference entries**:

- **GitHub CLI:** 205 documented command/help entry points and 205 example entries
- **Git:** 171 documented entry points and 263 example recipes, including porcelain, plumbing, official helpers, Git GUI/gitk/gitweb and Scalar
- **TWG:** all 691 public catalog paths, comprising 686 underlying canonical commands plus 5 explicit aliases; 691 example entries

The shared field `canonicalCommand` identifies an inventory entry point. For TWG it retains each published alias spelling so coverage can compare exactly with all 691 public paths. Aliases are explicitly mapped to their underlying command in the TWG source manifest.

The interface distinguishes command coverage from recipe counts. All topics shows every group with up to four representative entries; Show more opens that topic's complete inventory and resets pagination. Groups and their command entries use full-width rows, with command details and examples side by side on desktop and stacked on mobile. Search checks the entire selected tool, including entries outside the overview and key-option definitions. Category and search results are paginated at 48 entries, with a Show all option; previews and pagination never limit the searchable inventory.

## Coverage artifacts

- `cheatsheets-coverage.json`: normalized inventories consumed by regression tests
- `cheatsheets-coverage/gh.json.gz`: all manual pages, canonical commands, aliases, hidden-command exclusions, source digests and verification notes
- `cheatsheets-coverage/git.json.gz`: public command-list entries plus supplemental official man(1) helpers, pinned source digests and excluded guide pages
- `cheatsheets-coverage/twg.json.gz`: public catalog paths, alias mapping, static-source provenance, hidden-option exclusions and example classifications
- `cheatsheets-coverage/twg-validation.json`: TWG grammar, flag, identifier and shell-syntax validation results

The complete per-tool source manifests are stored as deterministic, lossless gzip snapshots; the test runner reads them directly. The normalized inventory remains plain JSON. Static reference records live in small JSON modules under `src/data/cheatsheets/`, assembled by `src/data/cheatsheets.ts`; they remain part of the app bundle, with no database.

Tests compare every declared inventory entry against the data, check exact-set coverage, enforce unique entry IDs and verify declared counts independently of recipe counts.

## GitHub CLI

- Public manual: https://cli.github.com/manual/gh_help_reference
- Manual snapshot: 2026-10-04
- Release cross-check: v2.102.0, released 2026-09-30; source commit `fc4b137cdef0a6bd28fd461b7cf9c84a5812a8cd`
- 236 manual pages are accounted for: group-only index pages are not counted as executable commands; executable parents and help topics are included
- 204 documented executable/help entries plus public `gh --version` yield 205 entries
- Important flags and selected JSON fields in examples were checked against the command manual; preview commands are labeled
- Personal aliases, arbitrary extension commands, hidden internal commands and the independent Copilot command language are outside this bounded inventory

The live manual may move independently of a release; the dated snapshot and source digests record the evidence used here. The user's installed version was not inferred from the documentation.

## Git

- Pinned public inventory: https://github.com/git/git/blob/v2.56.0/command-list.txt
- Version: 2.56.0, released 2026-09-28
- Scope: 161 command-list entries, the root `git` launcher and 9 supplemental documented man(1) helpers/aliases, totaling 171 entry points
- 263 recipes expand multi-mode commands such as branch, restore, reset, stash and worktree
- 35 guide/interface documentation pages are excluded as non-command pages
- `gitweb` is documented as a CGI frontend and shown via its official `git instaweb` launcher; shell helper libraries are shown using their documented sourcing conventions

All example shell syntax was checked without executing the commands. Destructive commands carry explicit warnings. Site/repository names and IDs are examples, not pre-approved action targets.

## Atlassian Teamwork Graph CLI (TWG)

- Official repository: https://github.com/atlassian/twg-cli
- Public catalog: https://atlassian.github.io/twg-cli/commands/commands-catalog/
- Catalog snapshot: public repository commit `56b9b3472458`
- Stable grammar: 1.3.3, extracted as text from the checksum-verified official release artifact without executing that binary
- Complete public inventory: 691 paths, including 5 mapped aliases
- 4,358 public option occurrences; hidden/internal options are excluded individually in the source manifest

There are **662 usage examples and 29 explicitly labeled templates**. The templates show real command forms but require the user to fill actual IDs, enums or runtime JSON/schema. They are not claimed to be universally executable. No command is replaced with a help-only example. Every template has input guidance and a visible badge; the coverage header also discloses the template count.

Examples and long flags were checked against the static command contracts, and shell syntax was validated. Service-side schema, permissions, installed release and tenant configuration can still affect an invocation. Verify those before executing mutations. Enriched reads can consume Rovo Credits; command and tool notices preserve this distinction.

No state-changing example was executed against a GitHub account, Atlassian tenant, or user repository during this work.
