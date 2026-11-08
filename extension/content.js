// Ground Truth for ReliefWeb: the side tab on a ReliefWeb report.
//
// Runs only on reliefweb.int/report/* (see manifest). Reads the report's URL and country tags,
// asks the background worker for this week's ACAPS question on that country, and offers it in
// a quiet tab at the bottom right. Nothing is sent anywhere until the expert presses send.
// Everything is drawn inside a shadow root so the report page's styles and ours never mix.

(() => {
  if (window.__groundTruthCompanion) return;
  window.__groundTruthCompanion = true;

  /* ------------------------------------------------------------ helpers */

  function h(tag, props = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : String(v));
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }

  // Static icon markup only (lucide paths); never built from page or API text.
  const ICON = {
    close:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    up: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>',
    check:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    eyeOff:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',
    out: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
  };

  function icon(name) {
    const span = h("span", { class: "icon" });
    span.innerHTML = ICON[name];
    return span;
  }

  const slug = (s) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  /** Places the report is about: the country in its URL, plus country tags inside the article. */
  function detectPlaces() {
    const places = new Set();
    const m = location.pathname.match(/^\/report\/([^/]+)\//);
    if (m && m[1] !== "world") places.add(decodeURIComponent(m[1]).toLowerCase());
    const scope = document.querySelector("main article, article, main");
    scope?.querySelectorAll('a[href*="/country/"]').forEach((a) => {
      const mm = (a.getAttribute("href") || "").match(/\/country\/([a-z]{3})(?:[/?#]|$)/i);
      if (mm) places.add(mm[1].toLowerCase());
    });
    return [...places];
  }

  const send = (msg) => new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
  const store = {
    get: async (key) => (await chrome.storage.local.get(key))[key],
    set: (key, value) => chrome.storage.local.set({ [key]: value }),
  };

  /* -------------------------------------------------------------- style */

  function injectFonts() {
    if (document.getElementById("gt-fonts")) return;
    const face = (w) =>
      `@font-face{font-family:"Archivo";font-weight:${w};font-display:swap;src:url("${chrome.runtime.getURL(
        `fonts/archivo-latin-${w}-normal.woff2`,
      )}") format("woff2")}`;
    document.head.append(h("style", { id: "gt-fonts", text: [400, 700, 800].map(face).join("") }));
  }

  const CSS = `
  :host { all: initial; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  [hidden] { display: none !important; }
  .root {
    --accent: #004b78; --accent-deep: #003a5e; --accent-soft: #dde9f1; --accent-bright: #7fb8de; --ink: #121212; --paper: #f4f4f1; --white: #fff; --high: #c8321e; --medium: #e07a10;
    --hair: #8d8d86;
    font-family: "Archivo", "Helvetica Neue", Arial, sans-serif;
    font-size: 17px; line-height: 1.45; color: var(--ink);
    -webkit-font-smoothing: antialiased;
  }
  button, textarea { font: inherit; color: inherit; }
  button { cursor: pointer; }
  :focus-visible { outline: 3px solid var(--ink); outline-offset: 2px; }
  .icon { display: inline-flex; flex: none; }
  .icon svg { display: block; }

  /* The closed tab: one quiet line at the bottom right. */
  .tab {
    position: fixed; right: 24px; bottom: 24px; z-index: 2147483000;
    display: flex; align-items: center; gap: 10px;
    min-height: 48px; padding: 0 14px 0 0;
    background: var(--accent); color: var(--white); border: 2px solid var(--ink);
    box-shadow: 0 8px 24px rgba(18, 18, 18, 0.22);
    font-weight: 800; font-size: 17px; text-align: left;
  }
  .tab .gt {
    align-self: stretch; display: grid; place-items: center; width: 44px;
    background: var(--ink); color: var(--accent-bright); font-weight: 800; font-size: 13px; letter-spacing: -0.02em;
  }
  @media (hover: hover) { .tab:hover { background: var(--accent-deep); } }

  /* The open panel. */
  .panel {
    position: fixed; right: 24px; bottom: 24px; z-index: 2147483001;
    width: 384px; max-height: calc(100vh - 48px); overflow: auto;
    background: var(--paper); border: 2px solid var(--ink);
    box-shadow: 0 16px 40px rgba(18, 18, 18, 0.26);
    animation: rise 220ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes rise { from { opacity: 0; transform: translateY(10px); } }
  @media (prefers-reduced-motion: reduce) { .panel { animation: none; } }
  @media (max-width: 520px) {
    .panel { right: 8px; left: 8px; bottom: 8px; width: auto; max-height: calc(100vh - 16px); }
    .tab { right: 12px; bottom: 12px; }
  }

  .band {
    position: sticky; top: 0; z-index: 1;
    display: flex; align-items: flex-end; gap: 12px;
    padding: 10px 10px 10px 14px; background: var(--accent); color: var(--white); border-bottom: 3px solid var(--ink);
  }
  .mark { display: grid; line-height: 1.1; }
  .mark strong { font-weight: 800; font-size: 17px; letter-spacing: -0.01em; }
  .mark span { font-size: 13px; }
  .where { margin-left: auto; display: grid; text-align: right; font-size: 13px; line-height: 1.3; }
  .where strong { font-weight: 800; }
  .close {
    align-self: center; display: grid; place-items: center; width: 36px; height: 36px;
    background: transparent; color: var(--white); border: 2px solid var(--white);
  }
  @media (hover: hover) { .close:hover { background: var(--accent-deep); } }
  .band :focus-visible { outline-color: var(--white); }

  .strip {
    display: flex; align-items: center; gap: 8px; padding: 8px 14px;
    background: var(--ink); color: var(--white); font-size: 13px; line-height: 1.3;
  }
  .strip strong { font-weight: 800; }
  .strip .icon { color: var(--accent-bright); }

  .block { padding: 16px 14px 18px; display: grid; gap: 12px; }
  .block + .block { border-top: 3px solid var(--ink); }
  .kind { font-size: 13px; font-weight: 700; }
  .question { font-size: 28px; line-height: 1.15; font-weight: 800; letter-spacing: -0.02em; outline: none; }
  .counts { font-size: 17px; }
  .deadline { font-size: 13px; padding-top: 8px; border-top: 1px solid var(--ink); }
  .deadline strong { font-weight: 800; }

  .answers { display: grid; gap: 8px; }
  .answer {
    display: flex; align-items: center; justify-content: space-between;
    min-height: 46px; padding: 0 14px; background: var(--white); border: 2px solid var(--ink);
    font-weight: 800; font-size: 17px; text-align: left;
  }
  .answer[aria-pressed="true"] { background: var(--ink); color: var(--white); }
  .answer[aria-pressed="true"] .icon { color: var(--accent-bright); }
  @media (hover: hover) { .answer[aria-pressed="false"]:hover { background: var(--accent-soft); } }

  /* Secondary picks: framed and ticked, never the black plate. */
  .picks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .pick {
    display: flex; align-items: center; justify-content: center; gap: 4px;
    min-height: 44px; padding: 0 4px; background: var(--white); border: 2px solid var(--ink);
    font-weight: 800; font-size: 13px; line-height: 1.15; text-align: center;
  }
  .pick + .pick { margin-left: -2px; }
  .pick[aria-pressed="true"] { box-shadow: inset 0 0 0 3px var(--ink); position: relative; }
  @media (hover: hover) { .pick[aria-pressed="false"]:hover { background: var(--accent-soft); } }

  .follow { display: grid; gap: 10px; }
  label { display: grid; gap: 4px; font-size: 13px; font-weight: 800; }
  label span { font-weight: 500; }
  textarea {
    width: 100%; min-height: 64px; padding: 8px 10px; resize: vertical;
    background: var(--white); border: 2px solid var(--ink); border-radius: 0; font-size: 17px; line-height: 1.4;
  }
  textarea::placeholder { color: #5c5c56; opacity: 1; }
  .primary {
    justify-self: start; min-height: 48px; padding: 0 18px;
    background: var(--accent); color: var(--white); border: 2px solid var(--ink); font-weight: 800; font-size: 17px;
  }
  .primary:disabled { opacity: 0.6; cursor: progress; }
  .secondary {
    justify-self: start; min-height: 44px; padding: 0 14px;
    background: var(--white); border: 2px solid var(--ink); font-weight: 700; font-size: 17px;
  }
  .err { padding: 8px 10px; border: 2px solid var(--high); background: var(--white); font-size: 13px; font-weight: 700; }

  .plate { display: grid; gap: 2px; padding: 12px 14px; background: var(--ink); color: var(--white); }
  .plate small { font-size: 13px; font-weight: 700; color: var(--accent-bright); }
  .plate b { font-size: 28px; line-height: 1.05; font-weight: 800; letter-spacing: -0.02em; }
  .flagged { display: flex; gap: 8px; align-items: flex-start; padding: 10px 12px; border: 2px dashed var(--ink); font-size: 13px; font-weight: 700; }

  a { color: var(--ink); font-weight: 700; text-underline-offset: 0.18em; }
  .link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; }
  .also { display: grid; gap: 6px; font-size: 13px; }
  .also strong { font-weight: 800; font-size: 13px; }

  .sub { font-size: 17px; font-weight: 800; line-height: 1.3; }
  .riskRow { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 13px; font-weight: 700; }
  .level { flex: none; padding: 2px 6px; font-weight: 800; color: var(--white); background: var(--ink); }
  .level[data-level="high"] { background: var(--high); }
  .level[data-level="medium"] { background: var(--medium); color: var(--ink); }
  .riskTitle { font-size: 13px; font-weight: 700; line-height: 1.3; }

  .foot { padding: 10px 14px 12px; border-top: 1px solid var(--ink); font-size: 13px; line-height: 1.35; }
  .foot strong { font-weight: 800; }
  `;

  /* --------------------------------------------------------------- build */

  async function start() {
    const places = detectPlaces();
    if (!places.length) return;
    const data = await send({ type: "lookup", places });
    if (!data || (!data.questions.length && !data.risks.length)) return;

    injectFonts();
    const host = h("div", { id: "ground-truth-companion" });
    const shadow = host.attachShadow({ mode: "open" });
    shadow.append(h("style", { text: CSS }));
    const root = h("div", { class: "root" });
    shadow.append(root);
    document.body.append(host);

    const reportUrl = location.href.split("#")[0];
    const reportTitle = (document.querySelector("h1")?.textContent || document.title).trim();
    const q = data.questions[0];
    const others = data.questions.slice(1);
    const risk = data.risks.find((r) => r.id === q?.riskId) || data.risks[0];
    const place =
      risk?.country.split(",").map((c) => c.trim()).find((c) => places.includes(slug(c))) ||
      risk?.country.split(",")[0].trim() ||
      "";

    /* The tab */
    const n = data.questions.length;
    const tab = h(
      "button",
      { class: "tab", type: "button", "aria-expanded": "false", "aria-controls": "gt-panel" },
      h("span", { class: "gt", "aria-hidden": "true", text: "GT" }),
      h("span", { text: n ? `${n} ACAPS question${n > 1 ? "s" : ""} on ${place}` : "Flag this report for ACAPS" }),
      icon("up"),
    );

    /* The panel */
    const panel = h("aside", { class: "panel", id: "gt-panel", "aria-label": "Ground Truth by ACAPS", hidden: true });
    const closeBtn = h("button", { class: "close", type: "button", "aria-label": "Close Ground Truth" }, icon("close"));
    panel.append(
      h(
        "header",
        { class: "band" },
        h("p", { class: "mark" }, h("strong", { text: "Ground Truth" }), h("span", { text: "by ACAPS" })),
        q
          ? h(
              "p",
              { class: "where" },
              h("strong", { text: `${q.panel} panel` }),
              h("span", { text: `${q.kindLabel} · ${q.position.index} of ${q.position.total} this week` }),
            )
          : h("p", { class: "where" }, h("strong", { text: place })),
        closeBtn,
      ),
      h(
        "p",
        { class: "strip" },
        icon("eyeOff"),
        h("span", {}, h("strong", { text: "Anonymous" }), " to other experts · known to ACAPS"),
      ),
    );

    if (q) panel.append(await questionBlock(q, others));
    if (risk) panel.append(await evidenceBlock(risk, reportUrl, reportTitle));
    panel.append(
      h(
        "footer",
        { class: "foot" },
        "Runs only on ReliefWeb reports. Nothing leaves this page until you press send.",
        data.source === "sample" ? [" ", h("strong", { text: "Demo data: the Ground Truth app is not running." })] : null,
      ),
    );

    root.append(tab, panel);

    const heading = panel.querySelector("[data-focus]");
    function open() {
      panel.hidden = false;
      tab.hidden = true;
      tab.setAttribute("aria-expanded", "true");
      (heading || closeBtn).focus();
    }
    function close() {
      panel.hidden = true;
      tab.hidden = false;
      tab.setAttribute("aria-expanded", "false");
      tab.focus();
    }
    tab.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    panel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  const ANSWERS = [
    ["yes", "Yes"],
    ["no", "No"],
    ["dk", "Don’t know"],
  ];

  async function questionBlock(q, others) {
    const key = `answered:${q.id}`;
    const saved = await store.get(key);
    let picked = null;

    const block = h("section", { class: "block", "aria-labelledby": "gt-q" });
    const heading = h("h2", { class: "question", id: "gt-q", tabindex: "-1", "data-focus": true, text: q.text });
    const buttons = ANSWERS.map(([value, label]) =>
      h(
        "button",
        { class: "answer", type: "button", "aria-pressed": "false", "data-value": value },
        h("span", { text: label }),
      ),
    );
    const note = h("textarea", { maxlength: "280", placeholder: "A line or a source is enough." });
    const sendBtn = h("button", { class: "primary", type: "button", text: "Send answer" });
    const err = h("p", { class: "err", role: "alert", hidden: true });
    const follow = h(
      "div",
      { class: "follow", hidden: true },
      h("label", {}, h("b", {}, "Why? ", h("span", { text: "optional · only ACAPS reads it" })), note),
      sendBtn,
      err,
    );
    const done = h("div", { class: "done", hidden: true });
    const form = h(
      "div",
      { class: "answers", role: "group", "aria-label": "Your answer" },
      buttons,
    );

    function select(value) {
      picked = value;
      for (const b of buttons) {
        const on = b.dataset.value === value;
        b.setAttribute("aria-pressed", String(on));
        b.querySelector(".icon")?.remove();
        if (on) b.append(icon("check"));
      }
      follow.hidden = false;
      err.hidden = true;
    }
    buttons.forEach((b) => b.addEventListener("click", () => select(b.dataset.value)));

    function showDone(record) {
      form.hidden = true;
      follow.hidden = true;
      done.hidden = false;
      done.replaceChildren(
        h(
          "div",
          { class: "plate" },
          h("small", { text: "Sent to ACAPS" }),
          h("b", { text: ANSWERS.find(([v]) => v === record.answer)?.[1] ?? record.answer }),
        ),
        h(
          "p",
          { class: "link" },
          h("a", { href: `${q.url}`, target: "_blank", rel: "noopener", text: "Change it on the full question page" }),
          icon("out"),
        ),
      );
    }

    sendBtn.addEventListener("click", async () => {
      if (!picked) return;
      sendBtn.disabled = true;
      sendBtn.textContent = "Sending…";
      const res = await send({
        type: "answer",
        payload: { questionId: q.id, answer: picked, note: note.value.trim() || undefined },
      });
      sendBtn.disabled = false;
      sendBtn.textContent = "Send answer";
      if (res?.ok) {
        const record = { answer: picked, at: new Date().toISOString() };
        await store.set(key, record);
        showDone(record);
      } else {
        err.hidden = false;
        err.textContent =
          res?.reason === "offline"
            ? "Ground Truth isn’t reachable, so your answer is still here. Open the app and try again."
            : "Your answer didn’t send. It is still here. Try again.";
      }
    });

    block.append(
      h("p", { class: "kind", text: "This week’s question on this country" }),
      heading,
      h("p", { class: "counts", text: q.counts }),
      h(
        "p",
        { class: "deadline" },
        h("strong", { text: "Answer by " }),
        q.answerByLabel,
        q.closesIn ? ` · closes in ${q.closesIn}` : "",
      ),
      form,
      follow,
      done,
    );
    if (saved) showDone(saved);

    if (others.length) {
      block.append(
        h(
          "div",
          { class: "also" },
          h("strong", { text: "Also this week" }),
          others.map((o) => h("a", { href: o.url, target: "_blank", rel: "noopener", text: o.text })),
        ),
      );
    }
    return block;
  }

  const DIRECTIONS = [
    ["raises", "Raises it"],
    ["lowers", "Lowers it"],
    ["none", "No change"],
  ];

  async function evidenceBlock(risk, reportUrl, reportTitle) {
    const key = `flagged:${risk.id}:${reportUrl}`;
    const saved = await store.get(key);
    let picked = null;

    const block = h("section", { class: "block", "aria-labelledby": "gt-ev" });
    const picks = DIRECTIONS.map(([value, label]) =>
      h("button", { class: "pick", type: "button", "aria-pressed": "false", "data-value": value }, h("span", { text: label })),
    );
    const note = h("textarea", { maxlength: "280", placeholder: "Which part, in a line." });
    const sendBtn = h("button", { class: "secondary", type: "button", text: "Send to ACAPS" });
    const err = h("p", { class: "err", role: "alert", hidden: true });
    const follow = h(
      "div",
      { class: "follow", hidden: true },
      h("label", {}, h("b", {}, "What in it? ", h("span", { text: "optional" })), note),
      sendBtn,
      err,
    );
    const group = h("div", { class: "picks", role: "group", "aria-label": "This report…" }, picks);
    const done = h("p", { class: "flagged", hidden: true });

    function select(value) {
      picked = value;
      for (const b of picks) {
        const on = b.dataset.value === value;
        b.setAttribute("aria-pressed", String(on));
        b.querySelector(".icon")?.remove();
        if (on) b.prepend(icon("check"));
      }
      follow.hidden = false;
      err.hidden = true;
    }
    picks.forEach((b) => b.addEventListener("click", () => select(b.dataset.value)));

    function showDone(record) {
      group.hidden = true;
      follow.hidden = true;
      done.hidden = false;
      const word = DIRECTIONS.find(([v]) => v === record.direction)?.[1].toLowerCase() ?? "";
      done.replaceChildren(
        icon("check"),
        h("span", {
          text: `Flagged: this report ${word === "no change" ? "changes nothing" : word.replace("it", "the risk")}. An ACAPS analyst reads it with risk ${risk.id}.`,
        }),
      );
    }

    sendBtn.addEventListener("click", async () => {
      if (!picked) return;
      sendBtn.disabled = true;
      const res = await send({
        type: "evidence",
        payload: { url: reportUrl, title: reportTitle, riskId: risk.id, direction: picked, note: note.value.trim() || undefined },
      });
      sendBtn.disabled = false;
      if (res?.ok) {
        const record = { direction: picked, at: new Date().toISOString() };
        await store.set(key, record);
        showDone(record);
      } else {
        err.hidden = false;
        err.textContent = "Couldn’t reach Ground Truth. Your flag is still here. Try again.";
      }
    });

    block.append(
      h("h2", { class: "sub", id: "gt-ev", text: "Does this report change the risk?" }),
      h(
        "p",
        { class: "riskRow" },
        h("span", { text: `Risk ${risk.id} · ${risk.country}` }),
        risk.level ? h("span", { class: "level", "data-level": risk.level.toLowerCase(), text: `${risk.level} risk` }) : null,
      ),
      h("p", { class: "riskTitle", text: risk.title }),
      group,
      follow,
      done,
    );
    if (saved) showDone(saved);
    return block;
  }

  start();
})();
