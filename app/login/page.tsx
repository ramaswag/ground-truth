import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Band } from "@/components/Band";
import { FIRST_QUESTION_ID } from "@/lib/questions";
import s from "./login.module.css";

export const metadata: Metadata = { title: "Sign in · Ground Truth by ACAPS" };

/** Demo sign-in: no accounts, picking a role just opens that side of the product. */
const ROLES = [
  {
    name: "Expert",
    hint: "Demo: you join the Chad demo panel automatically and answer this week's sample questions.",
    href: `/q/${FIRST_QUESTION_ID}`,
  },
  {
    name: "ACAPS moderator",
    hint: "Opens the Chad demo. Switch to any real country from the Risk Radar in the top strip.",
    href: "/moderate",
  },
];

export default function LoginPage() {
  return (
    <>
      <Band home="/login">
        <strong>Demo sign-in</strong>
      </Band>
      <main className={s.main}>
        <h1 className={s.title}>Who are you?</h1>
        <p className={s.lede}>
          This is a demo, so there is no account or password. Pick a role to see Ground Truth from that side. Come
          back here to switch.
        </p>
        <ul className={s.roles}>
          {ROLES.map((r) => (
            <li key={r.href}>
              <Link className={s.role} href={r.href}>
                <span className={s.roleText}>
                  <span className={s.roleName}>{r.name}</span>
                  <span className={s.roleHint}>{r.hint}</span>
                </span>
                <ArrowRight aria-hidden size={20} strokeWidth={2.5} className={s.roleArrow} />
              </Link>
            </li>
          ))}
        </ul>
        <p className={s.how}>
          New to Ground Truth?{" "}
          <Link className="btn" href="/how">
            How it works
            <ArrowRight aria-hidden size={18} strokeWidth={2.5} />
          </Link>
        </p>
      </main>
    </>
  );
}
