"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Change, Decision, GraphLink, GraphRisk, Lens, Workspace } from "@/lib/moderate";
import { PROBABILITY } from "@/lib/moderate";
import type { NewRisk } from "./AddRiskForm";

/**
 * The moderator's working state, shared by every /moderate page through the layout, so a
 * decision taken on one page shows on the radar and in the change log of the others.
 * Client-side only: nothing is saved, a reload starts the demo again.
 */

export type Outcome = "add" | "merge" | "reject" | "approve" | "hold" | "reviewed";

type Ctx = {
  data: Workspace;
  risks: GraphRisk[];
  links: GraphLink[];
  changes: Change[];
  byId: Record<string, GraphRisk>;
  /** Risks as they arrived, so a decided proposal can still be described after it is removed. */
  original: Record<string, GraphRisk>;
  outcomes: Record<string, string>;
  reviewed: Record<string, string>;
  open: Decision[];
  lens: Lens;
  setLens: (l: Lens) => void;
  selected: GraphRisk;
  select: (id: string) => void;
  /** Select a risk and go to the radar. */
  showOnRadar: (id: string) => void;
  decide: (d: Decision, o: Outcome) => void;
  addRisk: (n: NewRisk) => string;
  review: (id: string, note: string) => void;
  finderFor?: string;
  findExperts: (space: string) => void;
  announce: string;
};

const WorkspaceContext = createContext<Ctx | null>(null);

export function useWorkspace(): Ctx {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace outside WorkspaceProvider");
  return ctx;
}

/** Local time as "2026-11-07T14:05", the shape the change log uses. */
function nowStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function shortName(title: string): string {
  return title.split(/\s+/).slice(0, 3).join(" ");
}

/** A free spot on a ring near the parent's angle, keeping labels apart. */
function freeAngle(risks: GraphRisk[], layer: number, near: number): number {
  const gap = layer === 1 ? 50 : layer === 2 ? 30 : 24;
  const taken = risks.filter((r) => r.layer === layer).map((r) => r.angle);
  const dist = (a: number, b: number) => Math.abs((((a - b) % 360) + 540) % 360 - 180);
  for (let step = 0; step <= 180; step += 10) {
    for (const a of step ? [near + step, near - step] : [near]) {
      if (taken.every((t) => dist(a, t) >= gap)) return a;
    }
  }
  return near + 180;
}

export function WorkspaceProvider({ data, children }: { data: Workspace; children: React.ReactNode }) {
  const router = useRouter();
  const [risks, setRisks] = useState<GraphRisk[]>(data.risks);
  const [links, setLinks] = useState<GraphLink[]>(data.links);
  const [changes, setChanges] = useState<Change[]>(data.changes);
  const [outcomes, setOutcomes] = useState<Record<string, string>>({});
  const [reviewed, setReviewed] = useState<Record<string, string>>({});
  const [lens, setLens] = useState<Lens>("priority");
  const [selectedId, setSelectedId] = useState("R1043");
  const [finderFor, setFinderFor] = useState<string>();
  const [announce, setAnnounce] = useState("");

  const byId = useMemo(() => Object.fromEntries(risks.map((r) => [r.id, r])), [risks]);
  const original = useMemo(() => Object.fromEntries(data.risks.map((r) => [r.id, r])), [data.risks]);
  const selected = byId[selectedId] ?? risks[0];
  const open = data.decisions.filter((d) => !outcomes[d.id]);

  function select(id: string) {
    setSelectedId(id);
    setAnnounce(`Showing ${id}, ${byId[id]?.short ?? ""}`);
  }

  function showOnRadar(id: string) {
    select(id);
    router.push("/moderate");
  }

  function log(kind: Change["kind"], riskIds: string[], text: string) {
    setChanges((cs) => [
      { id: `C-you-${cs.length}`, at: nowStamp(), actor: { name: "You", kind: "you" }, kind, riskIds, text },
      ...cs,
    ]);
  }

  function decide(d: Decision, outcome: Outcome) {
    let note = "";
    if (d.kind === "proposal") {
      const r = original[d.riskId];
      if (outcome === "add") {
        setRisks((rs) => rs.map((x) => (x.id === d.riskId ? { ...x, status: "mapped" } : x)));
        setLinks((ls) => ls.map((l) => (l.to === d.riskId || l.from === d.riskId ? { ...l, status: "mapped" } : l)));
        note = "Added to the radar. It goes to the panel as a question next round.";
        log("added-risk", [d.riskId], `Added ${r.proposedBy}'s proposal to the radar.`);
      } else {
        const into = outcome === "merge" ? d.duplicateOf : undefined;
        setRisks((rs) => rs.filter((x) => x.id !== d.riskId));
        setLinks((ls) => ls.filter((l) => l.to !== d.riskId && l.from !== d.riskId));
        if (selectedId === d.riskId) setSelectedId(into ?? "R1043");
        note = into
          ? `Merged into ${into}. ${r.proposedBy} keeps the credit if it proves real.`
          : `Rejected. ${r.proposedBy}'s proposal stays on record.`;
        log(
          into ? "merged-risk" : "rejected-risk",
          into ? [d.riskId, into] : [d.riskId],
          into ? `Merged ${r.short} into ${byId[into]?.short ?? into}.` : `Rejected ${r.short}.`,
        );
      }
    } else if (d.kind === "move") {
      if (outcome === "approve") {
        setRisks((rs) =>
          rs.map((x) =>
            x.id === d.riskId
              ? {
                  ...x,
                  probability: d.to,
                  history: x.history.map((w, i, all) => (i === all.length - 1 ? { ...w, acaps: d.to } : w)),
                  lastMove: { week: data.context.week, note: "you approved the panel's reading" },
                }
              : x,
          ),
        );
        note = `Approved. ACAPS now reads it as ${PROBABILITY[d.to - 1]}.`;
        log("probability-move", [d.riskId], `Approved the panel's reading: ${PROBABILITY[d.to - 1]}.`);
      } else {
        note = "Held. ACAPS keeps its reading and asks again next round.";
        log("probability-move", [d.riskId], "Held the panel's reading for another round.");
      }
    } else {
      note = "Reviewed. Their answers stay out of the panel view until identities are checked.";
    }
    setOutcomes((o) => ({ ...o, [d.id]: note }));
    setAnnounce(note);
  }

  function addRisk(n: NewRisk): string {
    const target = byId[n.target];
    const layer = (n.relation === "follows" ? Math.min(target.layer + 1, 3) : Math.max(target.layer - 1, 1)) as
      | 1
      | 2
      | 3;
    const nextG = Math.max(...risks.filter((r) => r.id.startsWith("G-")).map((r) => Number(r.id.slice(2)))) + 1;
    const id = `G-${String(nextG).padStart(4, "0")}`;
    const fresh: GraphRisk = {
      id,
      title: n.title,
      short: n.label || shortName(n.title),
      place: n.place,
      layer,
      angle: freeAngle(risks, layer, target.angle),
      origin: "acaps",
      status: "mapped",
      priority: 0,
      history: target.history.map((w) => ({ week: w.week })),
    };
    setRisks((rs) => [...rs, fresh]);
    setLinks((ls) => [
      ...ls,
      {
        id: `L-you-${ls.length}`,
        from: n.relation === "follows" ? target.id : id,
        to: n.relation === "follows" ? id : target.id,
        status: "mapped",
        window: "6 months",
      },
    ]);
    log("added-risk", [id, target.id], `Added ${fresh.short}${n.source ? ` (source: ${n.source})` : ""}.`);
    setSelectedId(id);
    setAnnounce(`Added ${id} on layer ${layer}, linked to ${target.id}.`);
    return id;
  }

  function review(id: string, note: string) {
    setReviewed((r) => ({ ...r, [id]: note }));
    setAnnounce(note);
  }

  function findExperts(space: string) {
    setFinderFor(space);
    router.push("/moderate/gaps#finder");
  }

  const value: Ctx = {
    data,
    risks,
    links,
    changes,
    byId,
    original,
    outcomes,
    reviewed,
    open,
    lens,
    setLens,
    selected,
    select,
    showOnRadar,
    decide,
    addRisk,
    review,
    finderFor,
    findExperts,
    announce,
  };
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
