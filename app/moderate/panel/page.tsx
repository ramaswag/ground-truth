import type { Metadata } from "next";
import { PanelView } from "@/components/moderate/PanelView";

export const metadata: Metadata = { title: "Panel · Moderator · Ground Truth by ACAPS" };

export default function Page() {
  return <PanelView />;
}
