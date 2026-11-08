import { redirect } from "next/navigation";

/** Demo entry: pick a role first. */
export default function Home() {
  redirect("/login");
}
