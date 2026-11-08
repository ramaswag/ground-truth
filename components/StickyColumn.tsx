"use client";

import { useEffect, useRef, useState } from "react";

const GAP = 24;

/**
 * Keeps the answering column in view on desktop while the context column scrolls.
 * When the column is taller than the viewport (note and Send revealed), the sticky
 * offset goes negative, so the column scrolls until its bottom, Send included,
 * reaches the viewport and holds there.
 */
export function StickyColumn({
  className,
  children,
  style,
  ...rest
}: React.HTMLAttributes<HTMLElement> & { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [sticky, setSticky] = useState(false);
  const [top, setTop] = useState(GAP);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const wide = window.matchMedia("(min-width: 1024px)");
    const check = () => {
      setSticky(wide.matches);
      setTop(Math.min(GAP, window.innerHeight - el.offsetHeight - GAP));
    };
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener("resize", check);
    wide.addEventListener("change", check);
    check();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", check);
      wide.removeEventListener("change", check);
    };
  }, []);

  return (
    <section
      ref={ref}
      className={className}
      data-sticky={sticky}
      style={{ ...style, ["--stick-top" as string]: `${top}px` }}
      {...rest}
    >
      {children}
    </section>
  );
}
