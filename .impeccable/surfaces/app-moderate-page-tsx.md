---
version: 1
slug: "app-moderate-page-tsx"
primary_target: "app/moderate/page.tsx"
related_targets: []
---

# ACAPS moderator workspace

## Scope and mode

The ACAPS moderator's weekly review of one context (the Chad panel), at `/moderate`, split into six pages under one navigation bar: Radar (radar plus inspector, the page this contract describes), Decisions, Changes, Panel, Gaps and Outliers. Experts appear by real name on every page. Mode: Operate. Desktop first; readable on a phone but not optimised for it. Reached from the demo sign-in (`/login`).

## Audience, job, constraints

- ACAPS moderator/analyst who runs one context's panel and knows every expert's identity.
- Weekly job: check priority risks; consult the layered risk radar (radar rings chosen by the user over layered columns or a tree); see what changed this week (newly proposed risks, new links, probability moves) and who changed it; read each risk's trend over time; see who the panelists are; spot expertise gaps in a problem space and find new experts (via user-supplied software, not yet available: leave a clear slot); review outlier profiles who answer against the current reading.
- Add risks: approve, merge or reject risks flagged by experts, or enter one manually.
- Disagreement is signal, not a fault; bad-faith patterns go to an analyst; no shadow bans.
- Synthetic panel, links, trends and proposals, labelled as sample. Real Radar risks only where the sample export has them (R0002, R1043, R1055, R1066).

## Direction contract

THESIS: The context's risk web is the working surface: concentric layer rings the moderator reads, filters and selects, with an inspector that explains the selected risk. Refuses the category's KPI-card dashboard and the Lovable draft's rounded maroon cards.

OWN-WORLD: The Geneva Grid unchanged: blue band over 3px ink rule, ink context strip, paper ground, white fields with square 2px ink borders, Archivo at three sizes, vermilion only for High and errors, amber for Medium. On the radar: proposed risks and links dashed (hollow = not yet counted), priority marked by yellow fill, the selected risk the screen's one reversed ink plate.

STORY: The moderator sees the week's state in the strip, reads the radar under the Priority lens, switches lenses to see what changed, where coverage is thin and where the panel disagrees, selects a risk to read its trend, changes and coverage, then works down the decision queue, panel, gaps and outliers below.

FIRST VIEWPORT: 1440: band; ink strip (Chad panel, 7 experts, week 45 round, answers in, items needing a decision). Left 7 columns: lens tabs (Priority, Changes this week, Coverage, Disagreement) with Add risk at right, then the radar in a white ruled field, root at centre, three rings, ~12 nodes, legend bottom. Right 5 columns: inspector for the selected risk: ring and ID line with level badge, title at title-display size, facts row, 12-week trend (ACAPS step line, panel dots, change marked), what changed with who, coverage and disagreement. Signature move: lens tabs recolour the rings in place; selecting a node wipes the ink plate onto it and the inspector follows.

FORM: Grounded candidate 2 of 7, radar workbench (rings as working area plus inspector), dealt by the roll; ring-code raise kept: every risk's ID is the shared code between radar, lists and inspector. seed:2c909ad2bca190be

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Expert-finder software: the user will supply it later; the gaps section carries a labelled slot for it.
- Real Radar API and real panel data replace the synthetic draft data.
