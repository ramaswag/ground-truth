import { redirect } from "next/navigation";
import { DEMO_ISO } from "@/lib/moderate";

/** /moderate opens the context with a panel; the country picker in the strip switches. */
export default function ModerateIndex() {
  redirect(`/moderate/${DEMO_ISO}`);
}
