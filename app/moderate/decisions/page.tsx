import type { Metadata } from "next";
import { DecisionsView } from "@/components/moderate/DecisionsView";

export const metadata: Metadata = { title: "Decisions · Moderator · Ground Truth by ACAPS" };

export default function Page() {
  return <DecisionsView />;
}
