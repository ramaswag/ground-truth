import type { Metadata } from "next";
import { ChangesView } from "@/components/moderate/ChangesView";

export const metadata: Metadata = { title: "Changes · Moderator · Ground Truth by ACAPS" };

export default function Page() {
  return <ChangesView />;
}
