import Link from "next/link";
import s from "./shell.module.css";

/**
 * The blue shell band shared by every surface: wordmark left, context right.
 * Use <strong> inside children for the weight-800 line.
 */
export function Band({ home, children }: { home: string; children?: React.ReactNode }) {
  return (
    <header className={s.band}>
      <div className={s.bandInner}>
        <Link href={home} className={s.wordmark} aria-label="Ground Truth by ACAPS, home">
          <span className={s.wmName}>Ground Truth</span>
          <span className={s.wmBy}>by ACAPS</span>
        </Link>
        {children && <p className={s.position}>{children}</p>}
      </div>
    </header>
  );
}
