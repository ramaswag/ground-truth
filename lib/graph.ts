/**
 * The risk graph: cause-and-effect links between Risk Radar risks. Draft data: the risks
 * are real Radar records, the links between them are synthetic, written for this UI.
 *
 * A link is "mapped" once an analyst has accepted it, "proposed" while the panel is still
 * asked whether it holds. Link probabilities stay with ACAPS: experts never see them, so
 * their answers are not anchored to the current number.
 */

export type LinkStatus = "mapped" | "proposed";

export type RiskLink = {
  id: string;
  from: string;
  to: string;
  status: LinkStatus;
  /** How far ahead the link is judged, e.g. "6 months". */
  window: string;
  probability?: number;
};

const LINKS: RiskLink[] = [
  { id: "L-0021", from: "R0002", to: "R1043", status: "mapped", window: "6 months", probability: 0.8 },
  { id: "L-0034", from: "R1043", to: "R1055", status: "mapped", window: "6 months", probability: 0.5 },
  { id: "L-0058", from: "R1043", to: "R1066", status: "proposed", window: "6 months" },
];

export function getLink(id: string): RiskLink | undefined {
  return LINKS.find((l) => l.id === id);
}
