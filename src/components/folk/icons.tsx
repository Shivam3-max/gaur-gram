import { COW_BODY } from "./kit";
import { cx } from "@/lib/format";

/**
 * Folk-art icons: solid one-colour silhouettes in the same hand as the illustrations, drawn on a
 * 24px grid. Cut-outs use even-odd holes, so they sit on any background. Same props as lucide
 * (size, className), so they swap in one for one. UI controls (close, chevrons, search) stay lucide.
 */
type IconProps = { size?: number; className?: string; strokeWidth?: number };

function Svg({ size = 24, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false" className={cx("folk-icon shrink-0", className)}>
      {children}
    </svg>
  );
}

/** Circle as an even-odd subpath, for punching holes. */
const hole = (x: number, y: number, r: number) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const tick = "M7.9 13.1 L9.4 11.6 L11.1 13.3 L14.9 9.5 L16.4 11 L11.1 16.3 Z";

const RAYS = [162, 126, 90, 54, 18]
  .map((a) => {
    const p = (deg: number, r: number) => `${(12 + r * Math.cos((deg * Math.PI) / 180)).toFixed(2)} ${(16.4 - r * Math.sin((deg * Math.PI) / 180)).toFixed(2)}`;
    return `M${p(a - 9, 6.3)} L${p(a, 9.6)} L${p(a + 9, 6.3)} Z`;
  })
  .join(" ");

/** Sun rising over a ploughed field: morning delivery. */
export function Sunrise(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 16.4 A5 5 0 0 1 17 16.4 Z" />
      <path d={RAYS} />
      <path d="M2 17.6 H22 V19.2 H2 Z" />
      <path d="M4 21.6 H9 M11.5 21.6 H20" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

/** Painted Indian goods truck with a crowned cargo box: courier across India. */
export function Truck(p: IconProps) {
  return (
    <Svg {...p}>
      <path fillRule="evenodd" d="M1.8 6.6 Q7.3 3.5 12.8 6.6 V15.4 H1.8 Z M4.6 10 L5.8 11.2 L4.6 12.4 L3.4 11.2 Z M7.3 10 L8.5 11.2 L7.3 12.4 L6.1 11.2 Z M10 10 L11.2 11.2 L10 12.4 L8.8 11.2 Z" />
      <path fillRule="evenodd" d="M13.6 9 H18 L21.8 12.6 V15.4 H13.6 Z M14.9 10.3 H17.5 L19.6 12.4 H14.9 Z" />
      <path fillRule="evenodd" d={`${hole(6, 18, 2.3)} ${hole(6, 18, 0.85)} ${hole(17.6, 18, 2.3)} ${hole(17.6, 18, 0.85)}`} />
    </Svg>
  );
}

/** Glass milk bottle with a return arrow: returnable glass. */
export function Bottle(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10.4 2.6 H13.6 V4.1 H10.4 Z" />
      <path fillRule="evenodd" d="M10.7 4.7 H13.3 V6.6 C13.3 7.7 15 8.3 15 10.2 V17.2 C15 18 14.4 18.6 13.6 18.6 H10.4 C9.6 18.6 9 18 9 17.2 V10.2 C9 8.3 10.7 7.7 10.7 6.6 Z M9.9 12 H14.1 V14.3 H9.9 Z" />
      <path d="M18.6 15.4 A6.6 5.6 0 0 1 5.4 15.4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      <path d="M5.4 11.4 L7.9 15.6 L2.9 15.6 Z" />
    </Svg>
  );
}

/** Lab flask with bubbles: every batch tested. */
export function Flask(p: IconProps) {
  return (
    <Svg {...p}>
      <path
        fillRule="evenodd"
        d={`M9.2 2.6 H14.8 V4.1 H14 V8.6 L19.4 17.8 C20.3 19.4 19.2 21.2 17.4 21.2 H6.6 C4.8 21.2 3.7 19.4 4.6 17.8 L10 8.6 V4.1 H9.2 Z M8.9 12.2 Q10.5 11.4 12 12.2 T15.1 12.2 L15.5 13 Q13.6 12.2 12 13 T8.5 13 Z ${hole(10.3, 17, 1.25)} ${hole(13.8, 15.4, 0.8)} ${hole(13.4, 18.7, 0.7)}`}
      />
    </Svg>
  );
}

/** Shield with a tick: licensed and certified. */
export function Shield(p: IconProps) {
  return (
    <Svg {...p}>
      <path fillRule="evenodd" d={`M12 2.4 L19.6 5.2 V11.2 C19.6 16.1 16.4 19.7 12 21.6 C7.6 19.7 4.4 16.1 4.4 11.2 V5.2 Z ${tick}`} />
    </Svg>
  );
}

/** Drawstring potli with a coin: the prepaid wallet. */
export function Potli(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9.4 7.4 L7.4 3.6 Q9 4.5 10.2 3 Q12 4.6 13.8 3 Q15 4.5 16.6 3.6 L14.6 7.4 Z" />
      <path d="M8.6 7.9 H15.4 V9.1 H8.6 Z" />
      <path d="M15.2 8.6 Q17.6 9.2 17.8 12" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" />
      <path fillRule="evenodd" d={`M9.4 9.6 C4.6 12 3.6 21 12 21 C20.4 21 19.4 12 14.6 9.6 Z ${hole(12, 15.4, 3)} ${hole(12, 15.4, 1.5)}`} />
    </Svg>
  );
}

/** Wall calendar with a tick: pick your days. */
export function Calendar(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7.2 2.4 H9 V6.6 H7.2 Z M15 2.4 H16.8 V6.6 H15 Z" />
      <path fillRule="evenodd" d={`M5 4.6 H19 A1.8 1.8 0 0 1 20.8 6.4 V19.2 A1.8 1.8 0 0 1 19 21 H5 A1.8 1.8 0 0 1 3.2 19.2 V6.4 A1.8 1.8 0 0 1 5 4.6 Z M3.2 8.6 H20.8 V9.5 H3.2 Z M7.8 14.9 L9.2 13.5 L11 15.3 L14.8 11.5 L16.2 12.9 L11 18.1 Z`} />
    </Svg>
  );
}

/** Crescent moon and stars: change tomorrow until the night cutoff. */
export function Moon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14.5 3.2 A8.8 8.8 0 1 0 20.8 15.4 A7 7 0 0 1 14.5 3.2 Z" />
      <path d="M18.6 3.2 Q19 5.1 20.9 5.5 Q19 5.9 18.6 7.8 Q18.2 5.9 16.3 5.5 Q18.2 5.1 18.6 3.2 Z" />
      <path d="M21.2 8.6 Q21.4 9.6 22.4 9.8 Q21.4 10 21.2 11 Q21 10 20 9.8 Q21 9.6 21.2 8.6 Z" />
    </Svg>
  );
}

/** Travel trunk (peti): pause while you are away. */
export function Trunk(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 7.4 V5.4 C9 4.6 9.6 4 10.4 4 H13.6 C14.4 4 15 4.6 15 5.4 V7.4 H13.4 V5.6 H10.6 V7.4 Z" />
      <path fillRule="evenodd" d="M4 7.9 H20 C21.1 7.9 22 8.8 22 9.9 V18.9 C22 20 21.1 20.9 20 20.9 H4 C2.9 20.9 2 20 2 18.9 V9.9 C2 8.8 2.9 7.9 4 7.9 Z M6.5 8.9 H7.6 V19.9 H6.5 Z M16.4 8.9 H17.5 V19.9 H16.4 Z M12 12.4 L13.4 14.4 L12 16.4 L10.6 14.4 Z" />
    </Svg>
  );
}

/** The milkman's doodh can. */
export function MilkCan(p: IconProps) {
  return (
    <Svg {...p}>
      <path d={hole(12, 3, 1.15)} />
      <path d="M8.6 4.6 H15.4 C15.9 4.6 16.2 5 16.2 5.4 V6.4 H7.8 V5.4 C7.8 5 8.1 4.6 8.6 4.6 Z" />
      <path fillRule="evenodd" d="M9.4 7 H14.6 V8.6 L17.6 11 V19.6 C17.6 20.4 17 21 16.2 21 H7.8 C7 21 6.4 20.4 6.4 19.6 V11 L9.4 8.6 Z M7.4 13.2 H16.6 V14.1 H7.4 Z M7.4 17.3 H16.6 V18.2 H7.4 Z" />
    </Svg>
  );
}

function CowShape({ t, horns = true }: { t: string; horns?: boolean }) {
  return (
    <g transform={t}>
      <path d="M16 55 C11 58 10 68 11 80" fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" />
      <path d="M11 76 C7.6 81 8 87 11 90 C14 87 14.4 81 11 76 Z" />
      <path d={COW_BODY} />
      {horns && (
        <>
          <path d="M74 50.5 C72.6 45.5 74.6 41.4 78.8 39.4" fill="none" stroke="currentColor" strokeWidth={3.6} strokeLinecap="round" />
          <path d="M76.6 51 C77 46.5 79.8 43.4 83.6 42.4" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" />
        </>
      )}
      <path d="M73 53 C69 52 64 54.4 63 57.6 C68 59 71.6 57.6 74.6 56 Z" />
    </g>
  );
}

/** Desi cow with hump and horns: grazing, goshala. */
export function Cow(p: IconProps) {
  return (
    <Svg {...p}>
      <CowShape t="translate(-0.7 -4.6) scale(.25)" />
      <path d="M1.6 20.6 H22.4" stroke="currentColor" strokeWidth={1} strokeLinecap="round" opacity={0.6} />
    </Svg>
  );
}

/** Cow bending over her calf: calves drink first. */
export function CowCalf(p: IconProps) {
  return (
    <Svg {...p}>
      <CowShape t="translate(-1.4 0.6) scale(.2)" />
      <g stroke="var(--icon-sep, #ffffff)" strokeWidth={6} paintOrder="stroke" strokeLinejoin="round">
        <CowShape t="translate(24.2 7.6) scale(-.12 .12)" horns={false} />
      </g>
      <path d="M1.4 20.6 H22.6" stroke="currentColor" strokeWidth={1} strokeLinecap="round" opacity={0.6} />
    </Svg>
  );
}

/** Village hut with a door and windows: from our shed to your door. */
export function Hut(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2.4 11.2 L12 3.2 L21.6 11.2 Z" />
      <path fillRule="evenodd" d="M5.2 12 H18.8 V21 H5.2 Z M10.2 21 V16.8 A1.8 1.8 0 0 1 13.8 16.8 V21 Z M6.9 13.8 H9 V15.9 H6.9 Z M15 13.8 H17.1 V15.9 H15 Z" />
    </Svg>
  );
}

/** Two Warli figures holding hands: farmers we know. */
export function People(p: IconProps) {
  const fig = (x: number) => `M${x - 2.9} 7.4 H${x + 2.9} L${x} 12 Z M${x} 12 L${x + 2.9} 16.6 H${x - 2.9} Z ${hole(x, 4.6, 1.9)}`;
  return (
    <Svg {...p}>
      <path d={`${fig(7.2)} ${fig(16.8)}`} />
      <path
        d="M5.9 16.6 L5 21 M8.5 16.6 L9.4 21 M15.5 16.6 L14.6 21 M18.1 16.6 L19 21 M4.6 7.9 L2.7 12.6 M9.8 7.9 L12 11.2 L14.2 7.9 M19.4 7.9 L21.3 12.6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** A sprouting seedling: grown on our land. */
export function Sprout(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4.4 21 Q12 16.2 19.6 21 Z" />
      <path d="M11.3 18.6 V11.4 H12.7 V18.6 Z" />
      <path d="M12 12.4 C8 12.8 5 10.4 4.4 6.6 C8.5 6.2 11.5 8.4 12 12.4 Z" />
      <path d="M12 11 C12.4 6.4 15.4 3.6 20 3.8 C19.8 8.2 16.6 11 12 11 Z" />
    </Svg>
  );
}

/** Clay matka with the bilona churning stick: the bilona method. */
export function Churn(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M11.3 2.2 H12.7 V12 H11.3 Z M8.8 3.8 H15.2 V5 H8.8 Z" />
      <path d="M8.6 7 Q12 8.4 15.4 7" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" />
      <path fillRule="evenodd" d="M6.6 21 C3 18 3 12.6 7.7 11.6 L8.8 10.8 L8.3 9.8 H15.7 L15.2 10.8 L16.3 11.6 C21 12.6 21 18 17.4 21 Z M4.8 15.6 Q12 17 19.2 15.6 L19.2 16.5 Q12 17.9 4.8 16.5 Z" />
    </Svg>
  );
}
