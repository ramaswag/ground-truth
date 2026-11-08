import { siWhatsapp } from "simple-icons";

/** WhatsApp glyph from Simple Icons (CC0), drawn at the same optical size as the Lucide set. */
export function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false" fill="currentColor">
      <path d={siWhatsapp.path} />
    </svg>
  );
}
