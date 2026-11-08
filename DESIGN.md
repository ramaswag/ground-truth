---
name: Ground Truth by ACAPS
description: One expert question, set as a Swiss information poster that carries unchanged into WhatsApp, email and embeds.
colors:
  signal-blue: "#004b78"
  signal-blue-deep: "#003a5e"
  signal-blue-soft: "#dde9f1"
  signal-blue-bright: "#7fb8de"
  ink: "#121212"
  ink-soft: "#2b2b2b"
  paper: "#f4f4f1"
  white: "#ffffff"
  hairline: "#c9c9c2"
  hairline-strong: "#8d8d86"
  vermilion-high: "#c8321e"
  amber-medium: "#e07a10"
  whatsapp-green: "#1f7a4a"
  whatsapp-green-deep: "#17603a"
  whatsapp-bubble: "#dcf3d0"
  whatsapp-ground: "#ebe5dc"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.75rem, 1rem + 2.4vw, 3.25rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline-embed:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.125rem, 0.8rem + 1.6vw, 1.5rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 800
    lineHeight: 1.45
  body:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "tnum"
  label:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 800
    lineHeight: 1.35
  small:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.35
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: "0px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "64px"
  gutter-mobile: "20px"
  gutter-desktop: "32px"
  rule: "3px"
  border: "2px"
components:
  shell-band:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.white}"
    padding: "12px 20px"
    height: "60px"
  anonymity-strip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.small}"
    padding: "8px 20px"
    height: "44px"
  button-primary:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.white}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "54px"
  button-primary-hover:
    backgroundColor: "{colors.signal-blue-deep}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.signal-blue-soft}"
  button-whatsapp:
    backgroundColor: "{colors.whatsapp-green}"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "48px"
  button-whatsapp-hover:
    backgroundColor: "{colors.whatsapp-green-deep}"
  answer-option:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "58px"
  answer-option-hover:
    backgroundColor: "{colors.signal-blue-soft}"
  answer-option-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  input-field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "12px"
    height: "48px"
  tab:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    height: "46px"
  tab-selected:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.white}"
  plate-sent:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    padding: "16px 16px 24px"
  plate-pending:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    padding: "16px 16px 24px"
  plate-queued:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    padding: "16px 16px 24px"
  risk-level-high:
    backgroundColor: "{colors.vermilion-high}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    padding: "3px 8px"
  risk-level-medium:
    backgroundColor: "{colors.amber-medium}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "3px 8px"
  risk-level-low:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "3px 8px"
  embed-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 12px 16px"
  context-strip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.small}"
    padding: "8px 20px"
    height: "44px"
  radar-field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  radar-node:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "3px 8px"
    height: "30px"
  radar-node-surfaced:
    backgroundColor: "{colors.signal-blue-soft}"
  radar-node-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  decision-item:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 16px 16px"
  expert-finder-slot:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "16px"
---

# Design System: Ground Truth by ACAPS

## Overview

**Creative North Star: "The Geneva Grid"**

Ground Truth is set like an International Typographic Style information poster: one objective unit, flush left, on one grid, in one grotesk. A signal-blue band with white type over a heavy black rule announces the asker; a paper ground carries the question at display size; white fields with square 2px ink borders hold the three answers. Nothing is rounded, nothing floats, nothing is tinted for mood. Rank comes from weight, case and reversal, never from extra sizes or colours.

The system's one theatrical act is reversal. Choosing an answer wipes a solid ink plate across that answer from the left, and the sent confirmation is the same plate at display size. Everything else stays light so that plate is unmistakable. States that are not yet confirmed (pending ACAPS review, queued offline) keep the plate's shape but stay hollow.

The question is a portable unit. The same structure (asker band, question, Yes / No / Don't know, answer-by date) is set again, cell for cell, as the WhatsApp message, the plain-text email, the partner embed card and the 1200x630 share card. New surfaces inherit that unit rather than inventing a new one.

**Key Characteristics:**
- Signal-blue band with white type, 3px ink rule, paper ground, white fields, ink text.
- One grotesk (Archivo) at three sizes; weight 400/500/700/800 does the ranking.
- Square corners everywhere in the product's own chrome; 2px control borders, 3px section rules, 1px hairlines inside groups.
- The chosen element is the screen's only reversed ink plate: the answer on the expert page, the selected risk on the moderator workbench.
- Flat: no elevation shadows. Depth is rules and reversal.
- One question unit, transposed identically across page, WhatsApp, email, embed and OG card.

## Colors

A poster palette: one loud blue, one ink, one paper, and risk colours that only ever mean risk or error.

### Primary
- **Signal Blue** (signal-blue, #004b78): the shell band, the footer band, the OG card band, the primary action fill, the selected tab and text selection. Text and marks on it are always white: ink on this blue fails contrast (about 2:1). Blue means "this is Ground Truth" and "this is the action".
- **Deep Blue** (signal-blue-deep): hover state of the primary button only.
- **Pale Blue** (signal-blue-soft): hover fill on secondary buttons, answer options and secondary picks, and the quiet highlight behind ink text (radar nodes the active lens surfaces, moderator tab hover).
- **Bright Blue** (signal-blue-bright): blue marks on ink grounds: the anonymity strip's icon, separators and underline, the context strip's link underline, the sent plate's label, the selected answer's tick, the selected node's value tag, and focus rings on ink.

### Secondary
- **Vermilion** (vermilion-high): the High risk badge (page, WhatsApp/OG card) and error marks (invalid field border, field error text, failure icon). Nothing else.
- **Amber** (amber-medium): the Medium risk badge, with ink text.

### Neutral
- **Ink** (ink): all text, every control border and section rule, the selected-answer plate, the sent plate, the selected radar node, the anonymity strip and the moderator context strip, radar links, the ACAPS trend line, filled rating cells and completion bars, focus rings, scrollbar thumb.
- **Soft Ink** (ink-soft): secondary proof lines under risk ratings. Still a reading ink; it is never used to mute content into grey.
- **Paper** (paper): page ground, code sample ground.
- **White** (white): answer options, inputs, secondary buttons, tabs, the embed card, boxed notices, empty rating cells.
- **Hairline** (hairline): 1px dividers inside groups (untested triggers, mail header rows, preview frames, linked-risk lists) and trend-chart gridlines. Rules only, never text.
- **Strong Hairline** (hairline-strong): outlines of empty rating cells and completion tracks, the embed preview frame, the radar's layer rings. Rules only, never text.

### Medium-frame colours
- **WhatsApp Green** (whatsapp-green, hover whatsapp-green-deep): the "Open in WhatsApp" action only, darkened for AA on white.
- **WhatsApp Bubble / Ground** (whatsapp-bubble, whatsapp-ground): only inside the WhatsApp preview frame, which imitates the medium faithfully.

### Named Rules
**The One Plate Rule.** A solid ink fill behind white text marks the chosen element, exactly one per screen. On the expert page that is the chosen answer (the option plate, then the sent plate); on the moderator workbench it is the selected radar node, wiped in with the same 260ms scaleX. No other in-content element may be a reversed ink plate. The black anonymity strip and the moderator context strip are shell chrome, not content, and are the only exceptions.

**The Vermilion Means Danger Rule.** Vermilion appears only for High risk and for error marks. It is never decoration, never an accent, never a link colour.

**The No Grey Words Rule.** Text is ink or soft ink on light grounds, white or bright blue on ink, white on signal blue. Hairline greys are for rules and tracks, never for words.

## Typography

**Display Font:** Archivo (with Helvetica Neue, Arial, sans-serif), loaded via next/font at weights 400, 500, 700, 800.
**Body Font:** Archivo, same family.
**Label/Mono Font:** ui-monospace stack only for the embed code snippet.

**Character:** A single neutral grotesk in the Geneva lineage, set flush left, tight at display size, tabular figures throughout so dates and IDs align.

### Hierarchy
- **Display** (800, clamp 28px to 52px, 1.1, -0.025em): the question itself (max 22ch, balanced wrap) and the answer word inside the confirmation plate. One per screen.
- **Embed headline** (800, clamp 18px to 24px, 1.15, -0.02em): the question inside the partner embed card, where the host column is narrow; reused as the moderator workbench's display size for the inspector's risk title (max 36ch, balanced wrap).
- **Title** (800, 17px, 1.45): section headings (Why ACAPS is asking, Carry this question), answer labels, disclosure summaries, button labels (700 on secondary, 800 on primary).
- **Body** (400, 17px, 1.45): explanatory copy and notes, held to 58 to 62ch.
- **Label** (800, 13px, 1.35): field labels, fact values, tab labels, risk badges, the legend "Your answer". Sentence case, no tracking.
- **Small** (500, 13px, 1.35): fact keys, metadata, hints, the anonymity strip, footnotes.

### Named Rules
**The Three Sizes Rule.** Display, body (17px) and small (13px) are the only sizes on the page. A new level of hierarchy is made with weight or reversal, never with a fourth size. (The embed headline is the display size of the embed and of the moderator workbench, which sets no display-size question; it is never an extra step on a page that already has one.)

**The Sentence Case Rule.** No uppercase labels, no letter-spaced captions, no kicker lines above headings. A heading is a weight-800 title at body size, sitting under a rule.

## Layout

An 8px-cell rhythm (4, 8, 12, 16, 24, 32, 48, 64). The content container is 1240px max with a 20px gutter on phones and 32px from 768px. The moderator workbench is a desk tool and widens the container to 1440px by setting the max on a wrapper around the whole page, so band, context strip, main and footer widen together; the expert page stays at 1240px.

- **Phone (default):** one column. Shell band, anonymity strip, question owning the top of the viewport, one clock line and the "What counts as Yes" disclosure, three full-width 58px answer options; note and Send appear on selection with a short rise. Context sections (risk, carry panel) follow below, each under a 3px rule. Primary and confirmation actions go full width.
- **640px:** the follow-up actions sit side by side; the primary Send keeps a 220px minimum instead of full width; identity fields split into two columns.
- **768px:** gutter widens to 32px; the "who sees what" disclosure lays out three cells; the footer splits 1:2.
- **1024px and up:** a 7:5 two-column grid with a 48px gap. Left: question and answering. Right: risk context, then the transposition panel. The answering column is sticky; when it grows taller than the viewport (note and Send revealed), its sticky top goes negative (viewport height minus column height minus 24px) so it scrolls until Send is reachable and then holds.
- **Under 480px:** the inspector's four-cell facts row breaks two plus two, the lower pair under a 1px rule.
- **Moderator pages:** the workbench is six pages under one navigation bar (Radar, Decisions, Changes, Panel, Gaps, Outliers) that share one working state, so a decision on one page shows on the others. The frame is a full-height column so the footer sits at the window's foot on short pages. Each page but the radar opens with a section head: a 3px rule, the page title as an h1 at body size 800, and one small line of purpose.
- **Radar page:** radar then inspector in DOM order; one column with a 32px gap below 1024px, the 7:5 grid with a 48px gap from 1024px. When the window is at least 880px tall the radar column is sticky (16px from the top) while the inspector scrolls, except while the add-risk form is open.
- **Reading pages:** the decision queue and outliers hold to 880px, the change log to 1000px, the panel table runs full width; gaps pair the list with the expert-finder slot 7:5, the slot sticky from 1024px.

On the question page there is no facts table. Under the question sits one line at body size, weight 500, carrying only the clock the expert acts on: "Closes in 3 hours" in 800, then "· Resolves in 6 months" for a forecast or "· Looks ahead 6 months" for a risk link; the exact deadline is the hover title and returns after answering. Once answering closes, the line drops the clock (a fact check then has no line at all) and keeps only the horizon. How the answer is judged ("Checked against…", "Asked by…", the resolution date) sits in small 500 type inside the "What counts as Yes" disclosure. Where a facts table remains (the moderator inspector), it reads as a ruled table: a 3px rule on top, 1px ink verticals between cells, key in small weight 500, value in label weight 800.

## Elevation & Depth

Flat. There are no elevation shadows anywhere in the product's own chrome. Depth and grouping come from rules (3px section rules, 2px control borders, 1px hairlines) and from reversal (the ink plate). The only `box-shadow` uses are rule-drawing devices: inset 1px or 2px outlines on rating cells, tracks, the Low badge, radar level swatches and value tags, a 1px inset ink thickening on a hovered radar node, and a 4px inset ink underline on the selected tab. The WhatsApp bubble's 1px soft shadow belongs to the medium it imitates, not to the system.

### Named Rules
**The Rules Not Shadows Rule.** If something needs to separate from its ground, give it a border or a rule at one of the three weights. Never a drop shadow, never a hard offset shadow.

## Shapes

Square. Every control, field, tab, badge, plate, notice box, embed card and share card has 0 radius. Borders come in three weights with fixed jobs: 3px ink rules head sections, sit under the shell band and the anonymity strip, and top the inspector's facts table; 2px ink borders outline controls, boxes, disclosures and the embed card; 1px ink or hairline rules divide cells within a group. The pending state swaps the solid 2px border for a dashed one, and dashed means not yet counted wherever it appears: proposed radar risks and links, expert proposals in the decision queue, a pending identity check, a tool slot not yet connected. On the 1200x630 share card the same language scales up: an 8px band rule and 4px answer borders.

Medium-frame previews are the exception: the WhatsApp bubble (8px with a square tail corner) and its link card (6px) keep WhatsApp's own rounding, because they show the question as it will look inside that app.

## Components

### Buttons
Blunt and labelled; every button is a ruled rectangle.
- **Shape:** square (0), 2px ink border, 48px minimum height, 16px side padding, icon gap 8px.
- **Primary:** signal blue with ink border and white label at 800, 54px tall. Used once per state (Send, Next question). Black is never a button fill.
- **Secondary:** white with ink border, label 700. Hover fills pale blue.
- **WhatsApp:** WhatsApp green fill and border with white label; hover darkens.
- **Text button:** no border, underlined at 1px, thickening to 2px on hover; 44px minimum hit area.
- **Hover / Focus / Active:** background-colour fills only, 140ms ease-out, gated behind `(hover: hover)` so touch never sticks. Focus is a 3px ink outline offset 2px (bright blue on ink grounds, white on signal blue). Active nudges down 1px. Disabled drops to 60% opacity with a progress cursor.

### Answer options (signature)
The three answers are full-width white rows, 58px tall, 2px ink border, label at 800 with an optional small hint right-aligned ("Pass it on"). Hover (pointer devices only) fills pale blue. Selecting wipes an ink plate in from the left (260ms ease-out, scaleX) and flips the label to white with a bright blue check. Keyboard focus draws a 3px ink outline offset 3px around the whole row.

### Confirmation plate (signature)
After sending, the answer is restated as a plate: small label line, then the answer word at display size.
- **Sent:** solid ink plate, white word, bright blue label line. Clips in from the left over 320ms.
- **Pending ACAPS review:** white plate with a 2px dashed ink border, ink text. Hollow because it does not count yet.
- **Queued offline:** white plate with a solid 2px ink border.
- **Failed:** a white notice box with 2px ink border and a vermilion warning icon; the answer is not plated.
- **Closed:** after the deadline the answers give way to the same white notice box with an ink clock icon (closing is not a fault, so no vermilion): "This question closed Sun 8 Nov, 12:00 UTC." in 800, then that ACAPS is working with the answers it has; Next question follows. An expert who already answered keeps their plate, minus Change answer, and the until-line reads "Answering closed …".

### Inputs / Fields
- **Style:** white, 2px ink border, square, 48px minimum (textarea 76px, vertical resize), 12px padding, body size. Label above in label weight; optional marker in weight 500.
- **Focus:** 3px ink outline offset 2px.
- **Error:** border and outline turn vermilion; error text in vermilion at label size, weight 700.

### Tabs (transposition panel)
A single 2px ink box split into three equal cells by 2px ink dividers, 46px tall, label weight. The selected tab fills signal blue, white label, with a 4px ink underline drawn inside. Focus ring is inset (-5px offset) so it stays inside the box.

**Lens tabs** on the moderator radar are the same component at four cells (Priority, Changes this week, Coverage, Disagreement), sized to their labels with 16px side padding and no wrapping; under 640px they become a full-width 2 by 2 box. Arrow keys move between lenses. The Add risk action sits to their right in the same toolbar.

### Risk badge
A small square block at label weight with 3px by 8px padding: High is vermilion with white text; Medium is amber with ink text; Low is white with a 2px inset ink outline.

### Ratings and bars
Probability and impact are shown as five 8px cells with 3px gaps (filled ink, empty white with a 1px strong-hairline outline), always with a soft-ink proof line beneath naming the source. Trigger completion uses the same language as a 120px track.

### Disclosures
Summary rows between 2px ink rules top and bottom, 48 to 52px tall, title weight, with a chevron that rotates 180 degrees over 200ms. Body appears without animation.
- **Inline disclosure** ("What counts as Yes" under the question): no rules; the summary is a text button at body size 700, underlined 1px (2px on hover), 44px hit area, with the same 18px chevron and 200ms turn. Closed by default so the question and its answers own the first screen; the body opens at body size, max 58ch. Media that cannot disclose (WhatsApp, email) keep the line in full.

### Navigation / Shell
- **Shell band:** signal blue with white type, 60px minimum, wordmark (800, -0.02em) with "by ACAPS" beneath in 500, panel and position right-aligned in small type; 3px ink rule below. The footer repeats the band.
- **Anonymity strip:** ink ground, white small text with 800 emphasis, bright blue eye-off icon and separators, a "Who sees what" toggle underlined in bright blue that opens three ruled cells on white. 3px ink rule below.
- **Moderator context strip:** the anonymity strip's counterpart on the workbench, same chrome (ink ground, 44px minimum, small white text, bright blue separators, 3px ink rule below): context panel name at 800, panel size, round and closing date, answers in, and "Sample data, not saved". It wraps on phones.
- **Moderator navigation:** a white bar under the context strip with a 2px ink rule below, built as the tabs component at page scale: 48px cells of small 800 type divided by 2px ink rules, each with a count boxed by a 1px inset of the text colour (open decisions, changes, experts, gaps, unreviewed outliers). The current page fills signal blue with a white label and the 4px ink underline inside; hover fills pale blue. Under 640px it becomes a 3 by 2 grid of equal cells.
- **Filters** (change log): 40px white boxes with a 2px ink border and small 700 type, the chosen one signal blue with a white label, each with its count; radio inputs underneath, so arrow keys move between them.

### Embed card and share card
The question unit set for other hosts. Embed: white card, 2px ink border, blue top bar over a 3px rule (mark left, place right), embed-headline question, three equal answer links (46px, 2px ink border, hover pale blue), footer under a 1px ink rule. The card's own background goes transparent outside the card so spare iframe height sits on the host page. Share card (1200x630): paper ground, blue band with white type and an 8px ink rule, question at 54 to 62px/800, three 4px-bordered answer blocks, answer-by date right.

### Risk radar (signature)
The context's risk web as a working field. A white field with a 2px ink border, drawn at 760 by 680 and scaled to its column. Three concentric layer rings in 1px strong hairline around the root at centre, each labelled "Layer N" in small 500 ink on the left of the horizontal axis with a 5px white keyline so links never cut the words.
- **Links:** 1.5px ink lines; dashed (5 4) when proposed; 3px when they touch the selected risk.
- **Nodes:** square labels, 2px ink border, white, 30px minimum, 3px by 8px padding: an 8px level swatch (vermilion High, amber Medium, white with a 1px ink outline Low, none when unrated), the short name at 700, and the active lens's value in a tag boxed by a 1px inset of the text colour. Risk IDs never show on the radar: the inspector discloses a risk's ID once it is selected.
- **States:** proposed nodes are dashed; nodes the active lens surfaces fill pale blue; the selected node wipes the ink plate in from the left (260ms, scaleX), flips to white text with a solid border and a bright blue value tag. Hover thickens the border by a 1px inset; focus is the 3px ink outline offset 3px. Keyboard order puts surfaced nodes first, then by layer.
- **Narrow fields:** below a 660px container the ring labels drop. Below 520px (phones) the rings give way to the same risks as rows, one per layer (Root, Layer 1, 2, 3) under small 500 layer names and 1px hairline rules, each risk the same node with the same lens marks, dashes and selection plate; links then live only in the inspector.
- **Legend:** small text under a 1px ink rule at the foot of the field, naming what the lens shows.

### Inspector
Explains the selected risk and follows the selection. Title first at the embed-headline size (max 36ch, balanced), then a meta line at label weight: ID, layer, the level badge, place and origin in 500. A "Current reading" block comes first: its 3px section rule doubles as the top rule of a four-cell facts table (ACAPS probability, ACAPS impact, Since last update, Panel vs ACAPS as "4 agree, 3 against"), values aligned along the foot when a label wraps, empty cells saying "Not rated yet", "No update yet" or "Not asked yet", and a small coverage line under it; any decision waiting on the risk follows 16px below; then blocks each headed by a 3px rule with a body-weight 800 title and a small count at right.
- **Trend chart:** 140px plot with 1px ink axes, probability words on a 64px left axis, hairline gridlines; ACAPS's reading as a 3px ink step line; the panel median as 10px ink squares with a 2px white keyline; the week ACAPS changed its reading as a dashed 1px ink vertical (3 3). A key sits underneath. No history shows as a dashed 2px ink box.
- **Change rows:** a 108px when column and the change, separated by 1px ink rules. Risk IDs in text are small boxed codes (2px ink border, 800), dashed when proposed, pale blue on hover when they select.

### Decision queue items
White boxes with a 2px ink border, 12px top and 16px side and bottom padding, 8px apart. Expert proposals are dashed (hollow, not yet counted); everything else is solid. Title at body size 800, a small 500 meta line, then a row of buttons. After a decision the box turns solid and the buttons give way to a result line at label weight with a 16px check.

### Panel table
A white field with a 2px ink border. Headers at 800 over a 3px ink rule, rows on 1px ink rules, expert names at body size 800, numbers right-aligned, a pending identity check as a small dashed 2px tag. From 640px it keeps an 860px minimum and scrolls sideways inside its border. Under 640px each expert becomes a stacked row: header hidden from view, name and detail across a three-column grid, each number prefixed by its column label in 500 above a 1px ink rule, so nothing hides behind a sideways scroll.

### Not-yet-connected slot
A tool that is designed but not wired up (the expert finder) is a white box with a 2px dashed ink border and 16px padding: a body-weight 800 title, then small text saying plainly that it is not connected and what it will do. It takes focus when invoked so the request is acknowledged.

### Motion
One easing (`cubic-bezier(0.16, 1, 0.3, 1)`), short durations: 140ms button fills, 160ms option text colour, 200ms chevrons, 240ms follow-up rise (6px), 260ms plate wipe (answer option and selected radar node), 320ms sent-plate clip. All durations collapse under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** keep exactly one reversed ink plate per screen, on the chosen element: the answer (option plate, then sent plate) on the expert page, the selected radar node on the moderator workbench. The anonymity strip and the moderator context strip are the only other ink grounds, and they are chrome.
- **Do** mark not-yet-counted states as hollow plates: dashed 2px ink for pending ACAPS review, solid 2px ink for queued. Proposed radar risks and links and expert proposals in the queue are dashed for the same reason.
- **Do** make the primary action signal blue with a white label and a 2px ink border.
- **Do** carry any new transport of a question as the same unit: blue band with mark and risk, question, Yes / No / Don't know, answer-by date.
- **Do** gate hover fills behind `(hover: hover)`.
- **Do** head every section with a 3px ink rule and a weight-800 title at body size.
- **Do** keep square corners and the 3px / 2px / 1px border weights for all product chrome.
- **Do** keep text in ink or soft ink; put a source line beside every rating.

### Don't:
- **Don't** fill a button, card or badge with ink; black belongs to the chosen element (the answer, or the selected radar node).
- **Don't** use vermilion for anything but High risk and error marks.
- **Don't** add a fourth type size; rank with weight or reversal.
- **Don't** set uppercase or letter-spaced labels, or kicker lines above headings.
- **Don't** set text in hairline grey.
- **Don't** add rounded corners, drop shadows or hard offset shadows to product chrome (medium-faithful WhatsApp previews keep their own rounding).
- **Don't** introduce a second display face or a second accent colour.
