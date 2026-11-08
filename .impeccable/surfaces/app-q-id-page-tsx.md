---
version: 1
slug: "app-q-id-page-tsx"
primary_target: "app/q/[id]/page.tsx"
related_targets: []
---

# Expert question page

## Scope and mode

The page where one expert evaluates one ACAPS question. Expert-facing only (no ACAPS moderator UI). Mode: Operate. Mobile-first web, desktop supported.

## Audience, job, constraints

- Panel expert arriving from a WhatsApp or email link, often on a phone, sometimes low bandwidth.
- Job: answer Yes / No / Don't know in seconds, optionally add a short note; on Don't know, forward the question to a better-placed colleague via WhatsApp or email, prefilled.
- Two clocks, never confused: "Answer by" is when answering closes (UTC timestamp with time left, one to two days out, ahead of the weekly Risk Radar update); what the question is about lives in its text and in the second fact (resolves, checked against, looks ahead).
- Three kinds of question share the page: fact check, forecast, risk link. The band names the kind and the week's position; a risk link draws both risks as one edge of the graph (dashed while proposed) in the context column.
- After sending: confirmation; after a forecast, the risk's mapped links as optional one-tap checks, plus "add a risk ACAPS hasn't mapped". No group tally yet: the panel's view arrives in a planned round 2. Answer changeable until the question closes.
- The expert's own answer is the only reversed black plate. Secondary picks (link checks) are framed and ticked.
- Forwarded colleague answers are held "pending ACAPS review" until ACAPS knows who they are.
- Context: ACAPS risk summary (R1043, eastern Chad, High), collapsed by default.
- Shareable unit: the question renders as WhatsApp text (with its share card) and email, from one structure. The partner embed was dropped by the user.
- Anonymity copy: anonymous to other experts, known to ACAPS, never public.
- Synthetic data, labelled as sample where a visitor could mistake it.

## Direction contract

THESIS: The question is a Swiss information poster: one objective unit on one grid that transposes cell for cell into WhatsApp, email and embed. Refuses the category's rounded survey card with blue pills and a progress bar.

OWN-WORLD: Signal-blue #004B78 shell band with white type over a 3px black rule; paper #F4F4F1 ground, white answer fields, ink #121212; vermilion only for High risk. Archivo grotesk, flush left, three sizes, rank by weight, case and reversal. Square corners, 2px black control borders, 3px section rules. The selected answer is the screen's only reversed black plate; pending review is a hollow mark. No grey words.

STORY: The expert sees who asks and who can see them, reads one question, taps an answer, optionally says why, sends. Don't know turns into a prefilled forward. They leave trusting the anonymity and the speed.

FIRST VIEWPORT: Phone 390: blue band (wordmark, by ACAPS, Chad panel, 3 of 4); black anonymity strip; question at ~29px/800 owning the top half; meta line under it; three full-width 58px answers; note and Send appear on selection. Desktop: question and answers left 7 columns, risk context and transposition panel right.

FORM: Grounded candidate 6 of 7, International Typographic Style (Geneva lineage). Signature move: transposition, the same question unit set as WhatsApp, email and embed, switched in one tabbed panel that sits in the right column above the fold on desktop. seed:97c739186ce94e31

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Raises carried from declined challengers

- Proof beside every rating (monochrome canon).
- Three sizes; selected answer is the single reversed plate (timetable rack).
- One cell grid for page, share card and embed (Crouwel).
- The question dominates the first viewport (zoo map).
- Full state vocabulary: selected, sent, pending review, queued offline, failed (manual tab board).
- No grey words (datamatics).

## Unresolved

- Product name "Ground Truth" is provisional.
- French and other languages later; layout must tolerate ~30% longer strings.
- Real R1043 probability/impact values come from the Risk Radar export; use them if obtained, else label sample.
