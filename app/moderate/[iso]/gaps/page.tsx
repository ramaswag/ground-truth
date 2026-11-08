import type { Metadata } from "next";
import { GapsView } from "@/components/moderate/GapsView";

export const metadata: Metadata = { title: "Expertise gaps · Moderator · Ground Truth by ACAPS" };

export default function Page() {
  return <GapsView />;
}
