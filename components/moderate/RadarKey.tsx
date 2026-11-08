import type { Lens } from "@/lib/moderate";
import k from "./radar-key.module.css";

/** What the active lens highlights, said in a few words, with a sample of its number tag. */
const LENS_KEY: Record<Lens, { label: string; number: string; sample: string }> = {
  priority: { label: "Top 5 priorities", number: "number = rank", sample: "1" },
  changes: { label: "Changed this week", number: "number = changes", sample: "2" },
  coverage: { label: "Thin expert coverage", number: "number = experts covering", sample: "1/7" },
  disagreement: { label: "Panel split or against ACAPS", number: "number = Yes–No", sample: "4–3" },
};

/**
 * The radar's key, drawn rather than written: every entry is a small copy of the mark it explains,
 * so it can be read at a glance. The full sentence for the lens stays available to screen readers.
 */
export function RadarKey({ lens, sentence }: { lens: Lens; sentence: string }) {
  const lk = LENS_KEY[lens];
  return (
    <div className={k.key}>
      <p className="visually-hidden">{sentence} Dashed: proposed, not yet approved. Black: selected.</p>
      <ul className={k.items} aria-hidden>
        <li className={k.item}>
          <svg className={k.rings} viewBox="0 0 44 44" focusable="false">
            <circle cx="22" cy="22" r="20" />
            <circle cx="22" cy="22" r="13" />
            <circle cx="22" cy="22" r="6" />
            <rect x="19" y="19" width="6" height="6" />
            <path d="M25 22h14m-4-4 4 4-4 4" className={k.out} />
          </svg>
          <span className={k.text}>
            <b>Centre: picked risk</b>
            <span>L1, L2, L3: links away</span>
          </span>
        </li>

        <li className={k.item}>
          <span className={`${k.chip} ${k.flag}`}>
            <span className={k.dot} data-level="high" />
            Risk
            <span className={k.tag}>{lk.sample}</span>
          </span>
          <span className={k.text}>
            <b>{lk.label}</b>
            <span>{lk.number}</span>
          </span>
        </li>

        <li className={k.item}>
          <span className={k.levels}>
            <span className={k.dot} data-level="high" />
            <span className={k.dot} data-level="medium" />
            <span className={k.dot} data-level="low" />
          </span>
          <span className={k.text}>
            <b>Risk level</b>
            <span>High · Medium · Low</span>
          </span>
        </li>

        <li className={k.item}>
          <span className={k.proposed}>
            <span className={k.dash} />
            <span className={`${k.chip} ${k.dashed}`}>Risk</span>
          </span>
          <span className={k.text}>
            <b>Proposed</b>
            <span>not approved yet</span>
          </span>
        </li>

        <li className={k.item}>
          <span className={`${k.chip} ${k.selected}`}>Risk</span>
          <span className={k.text}>
            <b>Selected</b>
            <span>click any risk</span>
          </span>
        </li>
      </ul>
    </div>
  );
}
