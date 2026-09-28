import { Fire, Man, Woman } from "../folk/kit";

/**
 * Festival looks, switched on from Admin → Homepage & banners.
 * Purely decorative: hidden from screen readers, never block clicks, and still under reduced motion.
 */

const GREETING: Record<string, { hindi: string; en: string }> = {
  diwali: { hindi: "शुभ दीपावली", en: "Happy Diwali from the goshala" },
  holi: { hindi: "होली मुबारक", en: "Happy Holi from all of us" },
  lohri: { hindi: "लोहड़ी दीयाँ लख लख वधाइयाँ", en: "Happy Lohri" },
};

/** A garland (toran) of marigolds and mango leaves hanging under the header. */
export function FestivalToran({ festival }: { festival: string }) {
  if (festival !== "diwali" && festival !== "holi") return null;
  const holi = festival === "holi";
  const flowers = holi ? ["#e8457a", "#f2b632", "#4bb3a4", "#8b5cf6"] : ["#f0a324", "#e38a14"];
  return (
    <div aria-hidden="true" className="pointer-events-none relative z-40 -mb-11 h-11 overflow-hidden">
      <svg className="toran-sway h-full w-full" preserveAspectRatio="none">
        <defs>
          <pattern id={`toran-${festival}`} width="72" height="44" patternUnits="userSpaceOnUse">
            <path d="M0 2 Q36 20 72 2" fill="none" stroke="#9a5a36" strokeWidth="1.4" />
            {[10, 22, 36, 50, 62].map((x, i) => {
              const y = 2 + 18 * (1 - Math.pow((x - 36) / 36, 2)) * 0.98;
              return <circle key={x} cx={x} cy={y + 1.5} r={3.4} fill={flowers[i % flowers.length]} />;
            })}
            {/* hanging strand with a mango leaf */}
            <line x1="36" y1="11" x2="36" y2="27" stroke="#9a5a36" strokeWidth="1" />
            {[15, 20, 25].map((y, i) => <circle key={y} cx="36" cy={y} r={2.8} fill={flowers[(i + 1) % flowers.length]} />)}
            <path d="M36 27 C31 32 32 40 36 43 C40 40 41 32 36 27 Z" fill="#5f8f4b" />
            <path d="M36 28 L36 42" stroke="#3f6a33" strokeWidth=".6" />
          </pattern>
        </defs>
        <rect width="100%" height="44" fill={`url(#toran-${festival})`} />
      </svg>
    </div>
  );
}

function Diya({ x, delay }: { x: string; delay: string }) {
  return (
    <svg viewBox="0 0 60 50" className="absolute bottom-0 h-auto w-[52px] sm:w-[64px]" style={{ left: x }}>
      <defs>
        <radialGradient id="diya-glow">
          <stop offset="0" stopColor="#ffd36b" stopOpacity=".75" />
          <stop offset="1" stopColor="#ffd36b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="18" r="17" fill="url(#diya-glow)" className="diya-glow" style={{ animationDelay: delay }} />
      <g className="diya-flame" style={{ animationDelay: delay }}>
        <path d="M30 8 C35 16 36 22 30 27 C24 22 25 16 30 8 Z" fill="#f6a623" />
        <path d="M30 14 C32.5 18 33 22 30 25 C27 22 27.5 18 30 14 Z" fill="#fde08a" />
      </g>
      <path d="M6 28 Q30 30 54 28 Q52 44 30 46 Q8 44 6 28 Z" fill="#b8683f" />
      <path d="M6 28 Q30 33 54 28" fill="none" stroke="#7d3c20" strokeWidth="1.4" />
      <path d="M14 36 Q30 40 46 36" fill="none" stroke="#f3d9b8" strokeWidth="1" strokeDasharray="2 3" opacity=".7" />
    </svg>
  );
}

function Kite({ className, color, tail, delay }: { className: string; color: string; tail: string; delay: string }) {
  return (
    <svg viewBox="0 0 40 70" className={`kite-sway absolute ${className}`} style={{ animationDelay: delay }}>
      <path d="M20 2 L36 20 L20 40 L4 20 Z" fill={color} />
      <path d="M20 2 L20 40 M4 20 L36 20" stroke="#fff" strokeWidth="1" opacity=".7" />
      <path d="M20 40 C24 48 16 54 20 62 C23 67 19 69 21 70" fill="none" stroke={tail} strokeWidth="1.4" />
      {[46, 54, 62].map((y) => <path key={y} d={`M20 ${y} l-3 -2 l0 4 z M20 ${y} l3 -2 l0 4 z`} fill={tail} />)}
    </svg>
  );
}

/** Decorations for the homepage hero, positioned around the headline and video arch. */
export function FestivalHero({ festival }: { festival: string }) {
  if (!GREETING[festival]) return null;
  const g = GREETING[festival];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      <div className="absolute right-4 top-4 rounded-full border border-ghee/40 bg-white/85 px-4 py-1.5 text-center shadow-sm backdrop-blur sm:right-8 sm:top-6">
        <span className="font-deva text-[16px] text-ghee-deep sm:text-[18px]">{g.hindi}</span>
        <span className="hidden text-[11.5px] text-ink-3 sm:inline"> · {g.en}</span>
      </div>

      {festival === "diwali" && (
        <div className="absolute inset-x-0 bottom-[96px] h-[60px] sm:bottom-[118px]">
          {["2%", "14%", "26%", "38%"].map((x, i) => <Diya key={x} x={x} delay={`${-i * 0.37}s`} />)}
          <div className="hidden lg:block">
            {["88%", "94%"].map((x, i) => <Diya key={x} x={x} delay={`${-i * 0.5 - 0.2}s`} />)}
          </div>
        </div>
      )}

      {festival === "holi" && (
        <>
          {[
            ["-left-16 top-10 h-64 w-64", "#f472b6"],
            ["left-[30%] -top-16 h-56 w-56", "#facc15"],
            ["-right-10 top-1/3 h-72 w-72", "#34d399"],
            ["left-[10%] bottom-24 h-60 w-60", "#60a5fa"],
            ["right-[30%] bottom-10 h-52 w-52", "#fb923c"],
          ].map(([pos, c], i) => (
            <span key={pos} className={`gulal absolute rounded-full ${pos}`} style={{ background: `radial-gradient(circle, ${c}88 0%, ${c}33 45%, transparent 70%)`, animationDelay: `${-i * 1.7}s` }} />
          ))}
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="gulal-dot absolute h-2 w-2 rounded-full" style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 90}%`, background: ["#e8457a", "#f2b632", "#4bb3a4", "#8b5cf6", "#fb923c"][i % 5], animationDelay: `${-i * 0.6}s`, opacity: 0.55 }} />
          ))}
        </>
      )}

      {festival === "lohri" && (
        <>
          <Kite className="right-[8%] top-16 w-10 sm:w-12" color="#e8457a" tail="#f2b632" delay="0s" />
          <Kite className="right-[22%] top-28 hidden w-9 sm:block" color="#3d6b3a" tail="#e38a14" delay="-1.4s" />
          <Kite className="left-[42%] top-10 hidden w-8 lg:block" color="#f2b632" tail="#9a5a36" delay="-2.2s" />
          <svg viewBox="0 0 170 100" className="folk absolute bottom-[96px] left-2 h-[90px] w-auto sm:bottom-[118px] sm:left-6 sm:h-[110px]">
            <Man x={34} lean={-4} hands={[[-8, -62], [14, -62]]} armAnim={{ vals: [-12, 12, -12], dur: "0.9s" }} stride={3} />
            <g style={{ color: "#e0822f" }}>
              <Fire x={85} s={2.1} />
            </g>
            <Woman x={134} flip lean={-4} hands={[[-8, -60], [12, -62]]} armAnim={{ vals: [12, -12, 12], dur: "0.9s", begin: "-.45s" }} />
          </svg>
        </>
      )}
    </div>
  );
}
