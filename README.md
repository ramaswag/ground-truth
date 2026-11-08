# Ground Truth by ACAPS

Short, anonymous expert questions that ground ACAPS humanitarian risk analysis.

A small panel of experts per crisis (around 5 to 10) gets a handful of questions a week:
is this true on the ground now, will this happen, does this risk drive that one. Each
answer takes seconds: Yes, No or Don't know, with an optional note. A Don't know can be
forwarded to a better-placed colleague over WhatsApp or email. ACAPS moderators read the
answers against their own reading, update the Risk Radar, and watch where the panel
disagrees or has no expertise.

We built this for the ACAPS challenge at Hackathon for Good #8 (The Hague, November 2026).
It's a demo, not a finished product. The real Risk Radar data and the links you draw
between risks are saved in a small local database. The expert panel, answers and decisions
are sample data and reset when you reload.

## Run it

You need Node.js 22.18 or later. We use Node's built-in SQLite and run a TypeScript script
directly, and both need a recent Node. We built it on Node 26.

```bash
npm install
npm run db:seed    # load the Risk Radar export into the database
npm run dev
```

Open http://localhost:3000 and pick a role. There are no accounts or passwords.

- **Expert** puts you on the Chad demo panel straight away, with this week's sample questions.
- **ACAPS moderator** opens the Chad demo. Use the dropdown in the dark strip at the top to
  switch to any real country from the Risk Radar.

You can skip `npm run db:seed` the first time: if the database is empty, the app fills it
on its own. Run it again whenever you replace the CSV.

```bash
npm run typecheck   # TypeScript check
npm run build       # production build
```

## The wheel

The radar shows one risk at a time. Pick a risk in the row of tabs above the wheel and it
moves to the centre. Around it:

- **L1:** risks directly linked to it, whether it drives them or they drive it
- **L2:** risks linked to those
- **L3:** one link further out

Risks with no path to the centre don't show on that wheel. Pick them in the tabs instead.
Each tab shows how many links the risk has, so you can spot the ones nobody has connected yet.

Clicking a risk on the wheel opens it in the panel on the right without moving the wheel.
To make it the new centre, use **Put this risk in the centre** in that panel.

## Two kinds of workspace

**Chad (demo)** is the full story with made-up data: an expert panel, answers, links between
risks, decisions waiting, outliers and gaps. Use it to show how the weekly loop works. The
four R risks in it (R0002, R1043, R1055, R1066) read their details from the real export.
Nothing you do in the demo is saved.

**Every real country** (58 in the current export, including a real Chad) shows only what the
Risk Radar holds. The export has no links between risks, so each wheel starts with just the
risk in the centre. Draw links from the panel on the right and they're saved, and the wheel
fills in as you go. The panel, decisions, changes, gaps and outliers pages are empty for now.
Each one says what will show up there once a real panel exists.

## Pages

### Expert side

| Route | What it is |
|---|---|
| `/q/[id]` | One question: the claim or question, what counts as Yes, the answer options, a note, and Send. Context on the ACAPS risk behind it, and a panel to carry the question to WhatsApp, email or an embed. Try `Q-0411` (fact check), `Q-0412` and `Q-0413` (forecasts), `Q-0414` (risk link). |
| `/q/[id]/opengraph-image` | The 1200x630 share card for the same question. |
| `/how` | How it works: the weekly loop, the three kinds of question, how answers are combined. |

Extra switches on the question page: `?demo=sparse` shows a risk with the fields most
risks leave empty, `?demo=fail` makes the first send fail so you can see the retry state,
and `?r=<token>` opens the page the way a forwarded colleague would see it.

### Moderator side

`[iso]` is a country code from the export (`SDN`, `AFG`, `TCD`...) or `DEMO` for the Chad demo.

| Route | What it is |
|---|---|
| `/moderate/[iso]` | The wheel for one risk (picked in the tabs), with lenses for priority, changes this week, coverage and disagreement. Click a risk to see its reading, trend, changes, links and who covers it. Draw a link to another risk or add a risk by hand. |
| `/moderate/[iso]/decisions` | Risks experts proposed (add, merge or reject), panel readings waiting for approval, answer patterns to review. |
| `/moderate/[iso]/changes` | Every change this week and who made it. |
| `/moderate/[iso]/panel` | The experts, with role, verification, what they cover and how reliable they've been. |
| `/moderate/[iso]/gaps` | Topics with one verified expert or none, and a spot for an expert-finder tool (not connected yet). |
| `/moderate/[iso]/outliers` | Experts whose answers go against the current reading. |
| `/moderate/[iso]/data` | What's in the database, and a form to upload a newer Risk Radar export. |

### API and extension

| Path | What it is |
|---|---|
| `/api/questions?places=chad` | Read-only feed of open questions and their risks for given places. |
| `/api/links` | Saves (`POST`) or removes (`DELETE`) a link a moderator drew. |
| `/api/import` | Takes the CSV from the Data page and reloads the risks. |
| `/api/answers`, `/api/evidence` | Pretend endpoints the browser extension posts to. They don't store anything. |
| `extension/` | A browser extension that offers this week's question on ReliefWeb reports about the same country. See [extension/README.md](extension/README.md). |

## Data

- **The Risk Radar export** is public. It lives in `data/risk-radar-export.csv` (the app
  also accepts `data/risk-radar.csv`), with the column names ACAPS uses. If neither file is
  there, the app falls back to four sample rows in `data/risk-radar.sample.json`.
- **The database** is `data/ground-truth.db` (SQLite, not committed). It has the risks, which
  countries each risk covers, the links moderators drew, and a log of imports. All of it
  is in `lib/db.ts`. Reloading the export replaces the risks but keeps the links.
- **Things we work out from the export:** the short radar labels (first words of the title),
  priority (probability times impact, halved once a risk isn't active anymore), and the
  order of the risk tabs (active risks first, then by priority). The export has no history,
  so the trend starts with this week's reading.
- **Made up:** the questions, the Chad demo panel, expert and analyst names, its links,
  scores, trends, changes and proposals. The names don't belong to real people.

To swap the CSV for the Risk Radar API later, change how `lib/db.ts` fills the `risks`
table. Nothing else needs to change.

## Project layout

```
app/          pages and API routes (Next.js App Router)
components/   UI; components/moderate/ is the moderator workspace
lib/          data and helpers: database, Risk Radar parser, questions, moderator workspace
scripts/      seed.ts loads the export into the database
data/         the Risk Radar export, sample rows, and the local database
extension/    ReliefWeb browser extension (Manifest V3)
PRODUCT.md    who it's for, what it must do, product rules
DESIGN.md     the design system: colours, type, layout, components
.impeccable/  design decision records, sketches and review screenshots
```

Stack: Next.js 16 (App Router), React 19, TypeScript, CSS Modules, SQLite through Node's
built-in `node:sqlite`, Archivo, lucide icons. No login and no outside services.

## Design

It's meant to look like a Swiss information poster: one typeface at three sizes, square
ruled boxes, a blue band, and black for the one thing that matters on each screen.
DESIGN.md has every colour, size and component. PRODUCT.md has the product rules the
screens follow: anonymity, the three kinds of question, and how answers update the risks.
