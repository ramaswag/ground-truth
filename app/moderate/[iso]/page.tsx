import type { Metadata } from "next";
import { RadarView } from "@/components/moderate/RadarView";

export const metadata: Metadata = { title: "Radar · Moderator · Ground Truth by ACAPS" };

export default function RadarPage() {
  return <RadarView />;
}
