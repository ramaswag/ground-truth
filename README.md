# Ground Truth by ACAPS

Short, anonymous expert questions that ground ACAPS humanitarian risk analysis.

A small panel of experts per crisis (around 5 to 10) gets a handful of questions a week:
is this true on the ground now, will this happen, does this risk drive that one. Each
answer takes seconds: Yes, No or Don't know, with an optional note. A Don't know can be
forwarded to a better-placed colleague over WhatsApp or email. ACAPS moderators read the
answers against their own reading, update the Risk Radar, and watch where the panel
disagrees or has no expertise.

Built as a UI draft for the ACAPS challenge at Hackathon for Good #8 (The Hague,
November 2026). There is no backend: nothing is saved, and a reload resets the demo.

## Run it

Requires Node.js 20.9 or later (built on Node 24).

```bash
npm install
npm run dev
```

Open http://localhost:3000. The start page is a demo sign-in: pick **Expert** or **ACAPS
moderator**. There are no accounts or passwords.

```bash
npm run typecheck   # TypeScript check
npm run build       # production build
```

## What's in it

### Expert side

| Route | What it is |
|---|---|
| `/q/[id]` | One question: the claim or question, what counts as Yes, the answer options, a note, and Send. Context on the ACAPS risk behind it, and a panel to carry the question to WhatsApp, email or an embed. Try `Q-0411` (fact check), `Q-0412` and `Q-0413` (forecasts), `Q-0414` (risk link). |
| `/q/[id]/opengraph-image` | The 1200x630 share card for the same question. |
| `/how` | How it works: the weekly loop, the three kinds of question, how answers are combined. |

Demo switches on the question page: `?demo=sparse` shows a risk with the Radar fields most
risks leave empty; `?demo=fail` makes the first send fail, to show the retry state;
`?r=<token>` opens the page as a forwarded colleague would.

### ACAPS moderator side

| Route | What it is |
|---|---|
| `/moderate` | Risk radar for one context: risks on rings by distance from the root, with lenses for priority, changes this week, coverage and disagreement. Select a risk to see its current reading, 12-week trend, changes and who made them, links, and who covers it. Add a risk by hand. |
| `/moderate/decisions` | Risks experts proposed (add, merge or reject), panel readings waiting for approval, patterns to review. |
| `/moderate/changes` | Every change this week and who made it, filterable by experts, panel, ACAPS or you. |
| `/moderate/panel` | The experts by name, with role, verification, coverage, reliability and answers against ACAPS. |
| `/moderate/gaps` | Problem spaces with one verified expert or none, and a slot for an expert-finder tool (not connected yet). |
| `/moderate/outliers` | Experts whose answers run against the current reading. |

All moderator pages share one in-browser state, so a decision on one page shows on the others.

### Partner side

| Path | What it is |
|---|---|
| `/api/questions?places=chad` | Read-only feed of open questions and their risks for given places. |
| `/api/answers`, `/api/evidence` | Simulated endpoints the browser extension posts to. |
| `extension/` | A browser extension that offers this week's question on ReliefWeb reports about the same country. See [extension/README.md](extension/README.md). |

## Project layout

```
app/          routes (Next.js App Router)
components/   UI; components/moderate/ is the moderator workspace
lib/          data and helpers: questions, risk graph, Risk Radar adapter, moderator data
data/         Risk Radar sample rows
extension/    ReliefWeb browser extension (Manifest V3)
PRODUCT.md    who it is for, what it must do, product rules
DESIGN.md     the design system: colours, type, layout, components
.impeccable/  design decision records, sketches and review screenshots
```

Stack: Next.js 16 (App Router), React 19, TypeScript, CSS Modules, Archivo, lucide icons.
No database, no auth, no external services.

## Data

- **Real:** risks R0002, R1043, R1055 and R1066 are rows from the ACAPS Risk Radar export
  shared for the challenge, stored under the API's column names in
  `data/risk-radar.sample.json` and read through `lib/radar-source.ts`. Swap `loadRows` there
  for the Risk Radar API and nothing downstream changes.
- **Sample:** questions, panels, expert and analyst names, links between risks, scores,
  trends, changes and proposals are invented for this draft. Names belong to no real people.

## Design

The look is a Swiss information poster: one grotesk at three sizes, square ruled fields, a
signal-blue band, ink for the one chosen element per screen. DESIGN.md documents every token
and component; PRODUCT.md holds the product rules the UI follows (anonymity, the three kinds
of question, how answers update the risk graph).
