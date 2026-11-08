import type { Metadata } from "next";
import { OutliersView } from "@/components/moderate/OutliersView";

export const metadata: Metadata = { title: "Outliers · Moderator · Ground Truth by ACAPS" };

export default function Page() {
  return <OutliersView />;
}
