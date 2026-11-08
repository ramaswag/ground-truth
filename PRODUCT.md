# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Responsive, mobile-first in practice: experts arrive from WhatsApp and email links on phones, often on low bandwidth; analysts and some experts use desktop.

## Stack

Next.js (user choice). Scope of the current work is UI only: no backend. Risk data is real (ACAPS Risk Radar export, read through an adapter that matches the coming Risk Radar API); questions, panel and dates are synthetic. The only server routes are for the extension: a read-only question feed (`/api/questions`) and simulated `/api/answers` and `/api/evidence`.

## Users

**Primary: the expert.** A member of a small, ACAPS-moderated panel (around 5 to 10 experts per country or context): conflict experts, anticipatory action and early-warning practitioners, researchers, local NGO leaders. Busy, often in the field, some in sensitive contexts. Their job on this product: give a fast, honest read on one specific question about a crisis, or route it to someone who knows better.

**Secondary: other experts reached by forwarding.** A colleague who receives a forwarded question through WhatsApp or email, possibly not yet on the panel.

**Owner: ACAPS.** Analysts and moderators who write the questions, know every expert's identity, and use the answers to sharpen the ACAPS Risk List. On expert surfaces ACAPS appears only as the asker and the trust anchor. ACAPS moderators get their own workspace (`/moderate`), where every expert appears by real name: pseudonyms exist only between experts, never on the ACAPS side.

## Product Purpose

Turn the scattered, informal knowledge of humanitarian experts into structured ground truth for ACAPS risk analysis, without costing experts their time or their anonymity. One question, one answer, a few seconds. Success means experts recognise the picture (or correct it) close to the moment a crisis shifts, and come back next time because it was quick and felt respected.

## Positioning

The unit of the product is **the question and its answer**: a single, portable, self-contained object that travels where experts already are (WhatsApp, email) instead of asking them to live inside another platform. A "don't know" is not a dead end; it is a handoff to a better-placed expert, prefilled and one tap away.

## Operating Context

- Questions derive from ACAPS Risk List risks and their triggers for deterioration (e.g. R1043, "Escalating cross-border insecurity linked to the Sudan conflict increases protection risks and humanitarian needs in eastern Chad", active, rated high). Risks carry probability (very low to very high), impact (1 to 5) and an overall low/medium/high risk level, with a typical six-month horizon.
- Experts open a question from a link, answer, and leave. Contributions are short and focused by design.
- Delphi-style loop: experts answer independently first; any group view is anonymised.
- ACAPS moderates the panel and keeps it deliberately small.
- **Risk graph (target model).** Risks link to each other by cause and effect, forming a layered graph per context. Each risk has its own probability (the Radar fields) and each link a probability of linking. A question tests one element of the graph: a risk, a trigger, or a link (asked conditionally: "If A happens, will B follow?").
- **Same question, whole panel.** Every expert in a context gets the same question and answers independently, so answers are comparable data. A question's wording is frozen once the first answer arrives; translations share its ID.
- **Answers update the graph, through an analyst.** Aggregated answers move risk and link probabilities only after an ACAPS analyst approves, with a record of which answers moved them. Notes, "Don't know" patterns and answers against ACAPS's reading point to missing risks, missing links, or missing expert coverage.
- **Three kinds of question.** *Fact check* (verify: is this true now? checked against sources within days; settles fast, so it builds reliability scores in weeks rather than months; the Radar's Status and "What materialised?" fields are verification targets). *Forecast* (predict: will it happen by a date? moves a risk's probability). *Risk link* (map: does A drive B within a window? moves or creates a link).
- **Layered graph.** One graph, drawn in layers by distance from whichever root a context starts from (an earthquake, a conflict): layer 1 is what the root causes, layer 2 what those cause, and so on. Branches cross and loop back (conflict and earthquake both drive displacement; displacement can feed conflict), so it is a web, not a tree. Radar risks are mostly scenarios and may need splitting into cause and effect before linking.
- **Turnaround: answers within one to two days.** ACAPS updates the Risk Radar weekly, so every question closes in time for the next update: a fact check within about 24 hours, a forecast or risk link within about 48. Each question has two clocks that must never be confused: when answering closes (a UTC timestamp, shown with time left) and what the question is about ("this week, 2 to 8 November", "before 7 May 2027", "within 6 months"), which can be much longer. Each answer reaches ACAPS the moment it is sent; a result is usable as soon as a quorum has answered (for example four of seven), and late answers still count until close. One reminder goes to experts who have not answered by halfway. Urgent questions can go out between rounds with a window of hours. Forwarded colleagues need ACAPS vetting before they count, which can outlast a two-day window: a pre-vetted reserve of experts per context keeps forwards inside the cycle.
- **Weekly rounds.** At most five questions per expert per week: the same set for every expert in a context, in a randomised order, mixing kinds (for example two forecasts, two fact checks, one link). Urgent questions can go out between rounds. Planned round 2, inside the same window: once a quorum has answered, the panel's anonymised view and reasons open to experts who have already given their own first answer; until the question closes they can keep, change or contradict it with a reason. The first answer is the independent data point and the one reliability is scored on; revisions are stored separately and checked for herding. Forwarded colleagues get one question and never see the group view.
- **Follow-ups along the graph.** After a forecast, the expert sees the risk's mapped links (driven by, leads to), at most three, each one optional tap, the same for everyone whatever they answered. Showing a link invites agreement, so "No" costs exactly what "Yes" costs, and the acceptance rate of shown links is tracked. Experts never see ACAPS's link probabilities.
- **Proposed links.** ACAPS proposes links between risks not yet linked. Candidates come from geography, the risks' own text (LLM-ranked), graph shape (shortcuts, shared neighbours), expert notes and risks that materialised together; an analyst approves each before experts see it. Asked one direction at a time. A link joins the graph on panel agreement plus analyst approval, carries a strength, and is pruned if it stays weak. Links that cross contexts go to experts covering both ends. Experts are never tested with fake pairs.
- **Expert contributions.** An expert can add a missing risk: what it is, whether it drives or follows from the risk in hand, where, and a source. An LLM checks it against existing risks for duplicates; it enters the graph as proposed (dashed) and, after analyst approval, becomes a question for the panel. The contributor earns reliability credit if it proves real.
- **Reasons the panel may see (planned).** Once group views exist, an expert's reason may be shown to the panel. It is a separate field from the note for ACAPS only, and ACAPS reviews or paraphrases reasons before the panel sees them, so a reason never identifies its writer.
- **Risk data.** Risks come from the Risk Radar API: 25 columns, the same as the export. Only ID, title, ISO and country are always filled (trend 55%, triggers 78%, latest update 45%), so the page shows only what a risk has. Analysts write questions per trigger; LLM drafting may help behind the scenes, but experts never see an unapproved draft.
- **Expert reliability.** Every expert has an internal reliability score, updated as questions resolve. It rewards accuracy, not agreement with the panel, using a proper scoring rule (such as Brier) so an honest answer always scores best. It starts at the panel average and moves slowly, is kept per topic and region and carries partly across related risks in the graph. "Don't know" is never penalised. Identity verification is a separate score from forecasting accuracy.
- **Outliers and bad faith.** Disagreement is the most valuable signal, not a fault: an answer against ACAPS's current reading asks the expert what they are seeing. Manipulation is detected by patterns (coordinated changes, clusters of forwarded newcomers answering alike, steady bias on risks tied to one actor) and reviewed by an analyst. Proven bad faith means open removal from the panel. No shadow bans: experts are told answers are weighted by track record, and nobody but ACAPS ever sees a score.

## Capabilities and Constraints

- **Answer:** Yes / No / Don't know for every kind of question, plus a short note (why, or a source; "How do you know?" on a fact check). The note is optional, except when the answer goes against ACAPS's current reading of the question: then it is required ("What are you seeing?").
- **Forward on "Don't know":** the expert can send the question to another expert via WhatsApp or email, with the message prefilled.
- **Shareable unit:** the question (and, where appropriate, its answer state) renders as a WhatsApp message (with its share card) and an email. Same content, adapted per medium. No embed for partner platforms: dropped by the user.
- **ReliefWeb reading companion, prototype built (`/extension`; the user's preferred channel beyond WhatsApp).** A browser extension for panel experts that, on ReliefWeb reports only, offers the open question matching the report's country and lets the expert flag the report as evidence for or against a risk. It would be a quiet side tab, never a popup; scoped to reliefweb.int; sending nothing unless the expert acts. A desktop complement to WhatsApp, not a replacement, since most mobile browsers do not run extensions.
- **Anonymity (current rule):** experts are anonymous to one another; ACAPS knows who every expert is. Individual contributions are never attributed publicly. Per-expert anonymity levels (from the brief) are a future option, not in the current draft.
- **Current scope:** UI draft of two surfaces: the page where an expert evaluates a specific question (`/q/[id]`), and the ACAPS moderator workspace (`/moderate`: Radar, Decisions, Changes, Panel, Gaps and Outliers pages sharing one navigation and one working state; the expert finder is a slot awaiting the user-supplied tool). A fake demo sign-in (`/login`, also where `/` lands) switches between them by picking a role; no real auth.
- Data must be synthetic. No personal data of real experts.
- Must not feel like an AI chatbot. Not optimised for time-in-app.
- Open: product name is provisional ("Ground Truth", from the challenge title). French and other field languages are a stated "could"; English only for now. Low-bandwidth performance matters.

## Brand Commitments

- Owned by ACAPS, presented under its own product name with ACAPS as the trust anchor ("by ACAPS"). Visual world is designed fresh, not copied from ACAPS brand assets.
- Serious tool that communicates trust. Calm, precise, respectful of the subject and of the expert's time.

## Evidence on Hand

- `ACAPS Challenge Brief HFG#8.pdf`: the challenge brief (Hackathon for Good #8, 6-8 Nov 2026).
- Real ACAPS Risk Radar export (139 risks) from the challenge repository (github.com/Hackathon-for-Good-The-Hague/HFG8-ACAPS-Ground-Truth). The R1043 row is in `data/risk-radar.sample.json` under the API's column names; the Risk Radar API link is pending.
- No expert testimonials, participation numbers, logos, or partner endorsements exist. Do not fabricate them.

## Product Principles

1. **Seconds, not sessions.** Every question is answerable in one tap; anything more is optional.
2. **The question is the product.** It must stand alone and stay legible in any medium it is carried in.
3. **"Don't know" is a contribution.** Routing a question to the right person is as valuable as answering it.
4. **Anonymous to peers, accountable to ACAPS.** Make clear who sees what; never imply public attribution.
5. **Human, not automated.** Analysts ask, experts answer; any machine help stays behind the scenes.

## Accessibility & Inclusion

Field use on phones, intermittent and low-bandwidth connections, and non-native English readers. WCAG 2.2 AA as baseline; plain language; future French support should not require layout rework.
