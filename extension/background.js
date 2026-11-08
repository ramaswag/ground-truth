// Ground Truth for ReliefWeb: background worker.
// Talks to the Ground Truth app for the content script. Requests go from here, not from the
// ReliefWeb page, so the page never sees them and the browser's local-network rules allow them.

const CANDIDATES = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3220"];

async function probe(origin) {
  try {
    const res = await fetch(`${origin}/api/questions?places=`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return false;
    const json = await res.json();
    return json && json.app === "ground-truth";
  } catch {
    return false;
  }
}

/** The app's address: the one saved in the popup, else the first local port that answers as Ground Truth. */
async function appOrigin() {
  const { origin } = await chrome.storage.local.get("origin");
  const list = origin ? [origin, ...CANDIDATES.filter((c) => c !== origin)] : CANDIDATES;
  for (const o of list) {
    if (await probe(o)) {
      if (o !== origin) await chrome.storage.local.set({ origin: o });
      return o;
    }
  }
  return null;
}

/** Bundled snapshot of the sample questions, used when the app is not running (demo only). */
async function sample(places) {
  const res = await fetch(chrome.runtime.getURL("sample.json"));
  const data = await res.json();
  const wanted = new Set(places);
  const hit = data.places.some((p) => wanted.has(p));
  return hit ? { questions: data.questions, risks: data.risks } : { questions: [], risks: [] };
}

async function lookup(places) {
  const origin = await appOrigin();
  if (origin) {
    try {
      const res = await fetch(`${origin}/api/questions?places=${encodeURIComponent(places.join(","))}`);
      const json = await res.json();
      return { source: "live", origin, questions: json.questions, risks: json.risks };
    } catch {
      // fall through to the snapshot
    }
  }
  return { source: "sample", origin: null, ...(await sample(places)) };
}

async function post(path, body) {
  const origin = await appOrigin();
  if (!origin) return { ok: false, reason: "offline" };
  try {
    const res = await fetch(`${origin}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    return { ok: Boolean(json.ok), origin };
  } catch {
    return { ok: false, reason: "network" };
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  const run = async () => {
    if (msg.type === "lookup") return lookup(msg.places);
    if (msg.type === "answer") return post("/api/answers", { ...msg.payload, via: "reliefweb-extension" });
    if (msg.type === "evidence") return post("/api/evidence", msg.payload);
    if (msg.type === "status") return { origin: await appOrigin() };
    return null;
  };
  run().then(reply);
  return true; // keep the channel open for the async reply
});
