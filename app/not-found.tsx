import Link from "next/link";
import { FIRST_QUESTION_ID } from "@/lib/questions";

export default function NotFound() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "64px 20px" }}>
      <p style={{ fontSize: "var(--fs-small)", fontWeight: 800 }}>Ground Truth by ACAPS</p>
      <h1
        style={{
          fontSize: "var(--fs-display)",
          lineHeight: "var(--lh-display)",
          fontWeight: 800,
          letterSpacing: "-0.025em",
          margin: "16px 0",
        }}
      >
        This question is not available.
      </h1>
      <p style={{ marginBottom: 24 }}>
        It may have closed, or the link was cut short when it was copied. Ask the person who sent it for the full link.
      </p>
      <Link className="btn btn-primary" href={`/q/${FIRST_QUESTION_ID}`}>
        Go to your current question
      </Link>
    </main>
  );
}
