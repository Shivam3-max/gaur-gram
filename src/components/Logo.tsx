import { cx } from "@/lib/format";

/** Placeholder brand mark: a jharokha arch holding a ghee drop, crowned with gau horns. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 44" className={className} aria-hidden="true">
      <path d="M8 13 C4 10 3 6 5 3 C6 7 9 9 12 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 13 C36 10 37 6 35 3 C34 7 31 9 28 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 42 V22 A13 13 0 0 1 33 22 V42" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M20 19 C23.5 24 26 27.5 26 31 A6 6 0 0 1 14 31 C14 27.5 16.5 24 20 19 Z" fill="#c48a1c" />
      <path d="M3 42 H37" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", light ? "text-white" : "text-ink", className)}>
      <Mark className="h-9 w-8 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[25px] tracking-[-0.01em]">Gaurgram</span>
        <span className={cx("font-deva text-[11px] mt-0.5", light ? "text-white/70" : "text-ghee")}>गौग्राम · गौशाला से घर तक</span>
      </span>
    </span>
  );
}
