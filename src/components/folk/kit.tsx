/**
 * Folk-art drawing kit: silhouettes in one colour (currentColor), animated with SMIL so every
 * animation runs in the element's own coordinates and can be paused with svg.pauseAnimations().
 */

type Pt = [number, number];

/** Separation outline so overlapping silhouettes stay readable. Set --folk-sep to the section background. */
export const SEP = "var(--folk-sep, #ffffff)";
const sepProps = { stroke: SEP, strokeWidth: 1.3, paintOrder: "stroke" as const, strokeLinejoin: "round" as const };

const even = (n: number) => Array.from({ length: n }, (_, i) => +(i / (n - 1)).toFixed(4)).join(";");
const ease = (n: number) => Array.from({ length: n - 1 }, () => ".42 0 .58 1").join(";");

export function Swing({ vals, at, dur, begin = "0s" }: { vals: number[]; at: Pt; dur: string; begin?: string }) {
  return (
    <animateTransform
      attributeName="transform"
      type="rotate"
      additive="sum"
      values={vals.map((v) => `${v} ${at[0]} ${at[1]}`).join(";")}
      keyTimes={even(vals.length)}
      keySplines={ease(vals.length)}
      calcMode="spline"
      dur={dur}
      begin={begin}
      repeatCount="indefinite"
    />
  );
}

export function Shift({ vals, dur, begin = "0s", linear = false }: { vals: Pt[]; dur: string; begin?: string; linear?: boolean }) {
  return (
    <animateTransform
      attributeName="transform"
      type="translate"
      additive="sum"
      values={vals.map((v) => `${v[0]} ${v[1]}`).join(";")}
      keyTimes={even(vals.length)}
      {...(linear ? { calcMode: "linear" } : { calcMode: "spline", keySplines: ease(vals.length) })}
      dur={dur}
      begin={begin}
      repeatCount="indefinite"
    />
  );
}

export function Spin({ at, dur, reverse = false }: { at: Pt; dur: string; reverse?: boolean }) {
  return (
    <animateTransform
      attributeName="transform"
      type="rotate"
      additive="sum"
      from={`0 ${at[0]} ${at[1]}`}
      to={`${reverse ? -360 : 360} ${at[0]} ${at[1]}`}
      dur={dur}
      repeatCount="indefinite"
    />
  );
}

function rot([x, y]: Pt, deg: number): Pt {
  const r = (deg * Math.PI) / 180;
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
}

function armPath(s: Pt, h: Pt) {
  const dx = h[0] - s[0];
  const dy = h[1] - s[1];
  const len = Math.hypot(dx, dy) || 1;
  let px = (-dy / len) * 4.5;
  let py = (dx / len) * 4.5;
  if (py < 0) {
    px = -px;
    py = -py;
  }
  const c: Pt = [(s[0] + h[0]) / 2 + px, (s[1] + h[1]) / 2 + py];
  return `M${s[0].toFixed(1)} ${s[1].toFixed(1)} Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${h[0].toFixed(1)} ${h[1].toFixed(1)}`;
}

function Arms({ s, hands, anim, held }: { s: Pt; hands: Pt[]; anim?: { vals: number[]; dur: string; begin?: string }; held?: React.ReactNode }) {
  const s2: Pt = [s[0] - 1.6, s[1] + 1];
  return (
    <g>
      {hands.map((h, i) => (
        <path key={`b${i}`} d={armPath(i ? s2 : s, h)} fill="none" stroke={SEP} strokeWidth={5.2} strokeLinecap="round" />
      ))}
      {hands.map((h, i) => (
        <path key={i} d={armPath(i ? s2 : s, h)} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      ))}
      {held}
      {anim && <Swing vals={anim.vals} at={s} dur={anim.dur} begin={anim.begin} />}
    </g>
  );
}

type FigureProps = {
  x: number;
  y?: number;
  lean?: number;
  flip?: boolean;
  /** Hand positions relative to the figure's feet, facing right. */
  hands: Pt[];
  armAnim?: { vals: number[]; dur: string; begin?: string };
  /** Things held in the hands that move with the arms (drawn in the same local space). */
  held?: React.ReactNode;
  children?: React.ReactNode;
};

/** A woman in lehenga and odhni. Pose: standing (default) or squatting. */
export function Woman({ x, y = 100, lean = 0, squat = false, flip = false, hands, armAnim, held, children, walk = false }: FigureProps & { squat?: boolean; walk?: boolean }) {
  const waist: Pt = squat ? [0, -20] : [0, -34];
  const sh = rot([3, -11], lean);
  const s: Pt = [waist[0] + sh[0], waist[1] + sh[1]];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      {squat ? (
        <path {...sepProps} d="M-6 -20 L6 -20 C10 -13 14 -9 15 -3 Q1 1 -13 -3 C-12 -9 -10 -14 -6 -20 Z" fill="currentColor" />
      ) : walk ? (
        <>
          <path {...sepProps} d="M-4.6 -34 L4.6 -34 L12 -5 Q0 -1 -10 -5 Z" fill="currentColor" />
          <ellipse cx={-5} cy={-1.8} rx={3} ry={1.6} fill="currentColor" />
          <ellipse cx={8} cy={-1.8} rx={3} ry={1.6} fill="currentColor" />
        </>
      ) : (
        <>
          <path {...sepProps} d="M-4.6 -34 L4.6 -34 L11 -4.5 Q0 -0.5 -11 -4.5 Z" fill="currentColor" />
          <ellipse cx={-3.5} cy={-1.8} rx={3} ry={1.6} fill="currentColor" />
          <ellipse cx={4.5} cy={-1.8} rx={3} ry={1.6} fill="currentColor" />
        </>
      )}
      <g transform={`translate(${waist[0]} ${waist[1]}) rotate(${lean})`}>
        <path {...sepProps} d="M-1.5 -25.2 C-8.5 -24 -10.5 -12 -8 -1 L-4.8 -2 C-6.8 -10 -5.8 -19 -1 -24 Z" fill="currentColor" opacity={0.85} />
        <path {...sepProps} d="M-4.6 1 L-5 -12 Q0 -15 5 -12 L4.6 1 Z" fill="currentColor" />
        <path d="M0 -13 L0.6 -16.5" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
        <circle {...sepProps} cx={1.3} cy={-20.8} r={5} fill="currentColor" />
        <circle cx={-3.4} cy={-23.8} r={2.7} fill="currentColor" />
      </g>
      <Arms s={s} hands={hands} anim={armAnim} held={held} />
      {children}
    </g>
  );
}

/** A man in kurta, dhoti and pagri. */
export function Man({ x, y = 100, lean = 0, flip = false, hands, armAnim, held, children, stride = 0 }: FigureProps & { stride?: number }) {
  const hip: Pt = [0, -28];
  const sh = rot([3, -19], lean);
  const s: Pt = [hip[0] + sh[0], hip[1] + sh[1]];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <path {...sepProps} d={`M-4.5 -29 L4.5 -29 L${6 + stride} -2 L${1.8 + stride} -2 L0 -17 L${-1.8 - stride} -2 L${-6 - stride} -2 Z`} fill="currentColor" />
      <g transform={`translate(${hip[0]} ${hip[1]}) rotate(${lean})`}>
        <path {...sepProps} d="M-5.4 3 L-5.2 -19 Q0 -22.5 5.2 -19 L6.6 3 Q0 5 -5.4 3 Z" fill="currentColor" />
        <path d="M0 -21 L0.4 -24" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
        <circle {...sepProps} cx={1} cy={-28.5} r={4.6} fill="currentColor" />
        <path {...sepProps} d="M-4.8 -29.5 C-5.6 -36 2 -38.6 6 -32 C4 -33.6 0 -33.8 -4.8 -29.5 Z" fill="currentColor" />
        <path d="M-4.2 -31 C-8 -31 -9.5 -27 -9 -24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      </g>
      <Arms s={s} hands={hands} anim={armAnim} held={held} />
      {children}
    </g>
  );
}

const COW_BODY =
  "M16 53 C26 49 42 50 50 49 C53 45 58 42 62 44 C66 46 70 49 74 50 C80 51 86 55 91 60 C93 62 93 65 90 66 C86 67 81 67 78 69 C75 72 72 76 71 80 C70 81 68 80 67 79 L67 94 L68 96 L63 96 L63.5 82 L61 82 L61 94 L62 96 L57 96 L57.5 82 C48 85 38 85 31 82 L31 94 L32 96 L27 96 L27 84 L25 84 C25 88 24 91 23 94 L24 96 L19 96 L19.5 92 C19 86 16 80 15 74 C13 66 13 58 16 53 Z";

/** Desi cow with hump and curved horns, facing right. x/y place the hooves' centre line. */
export function Cow({ x, y = 100, scale = 1, flip = false, horns = true, udder = true, tailSwish = true, begin = "0s" }: { x: number; y?: number; scale?: number; flip?: boolean; horns?: boolean; udder?: boolean; tailSwish?: boolean; begin?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * scale} ${scale}) translate(-54 -96)`}>
      <g>
        <path d="M16 55 C11 58 10 68 11 80" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        <path d="M11 78 C8.6 82 8.8 86 11 89 C13.2 86 13.4 82 11 78 Z" fill="currentColor" />
        {tailSwish && <Swing vals={[0, 9, -5, 0]} at={[16, 55]} dur="3.4s" begin={begin} />}
      </g>
      <path {...sepProps} d={COW_BODY} fill="currentColor" />
      {udder && <ellipse cx={29.5} cy={83.4} rx={3.6} ry={2.6} fill="currentColor" />}
      {horns && (
        <>
          <path d="M74 50.5 C72.6 45.5 74.6 41.4 78.8 39.4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          <path d="M76.6 51 C77 46.5 79.8 43.4 83.6 42.4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
        </>
      )}
      <g>
        <path d="M73 54 C69 53 65 55 64 57.4 C68 58.4 71 57.4 74 56 Z" fill="currentColor" />
        <Swing vals={[0, 0, -14, 0, 0]} at={[73, 55]} dur="5s" begin={begin} />
      </g>
      <circle cx={82.4} cy={56.6} r={1} fill={SEP} />
    </g>
  );
}

/** Clay matka. Base centre at (x, y). */
export function Matka({ x, y = 100, w = 24, h = 20, lid = false }: { x: number; y?: number; w?: number; h?: number; lid?: boolean }) {
  const d = `M${-0.34 * w} 0 C${-0.62 * w} ${-0.26 * h} ${-0.62 * w} ${-0.74 * h} ${-0.27 * w} ${-0.86 * h} L${-0.2 * w} ${-0.92 * h} L${-0.23 * w} ${-h} L${0.23 * w} ${-h} L${0.2 * w} ${-0.92 * h} L${0.27 * w} ${-0.86 * h} C${0.62 * w} ${-0.74 * h} ${0.62 * w} ${-0.26 * h} ${0.34 * w} 0 Z`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path {...sepProps} d={d} fill="currentColor" />
      <path d={`M${-0.5 * w} ${-0.46 * h} Q0 ${-0.36 * h} ${0.5 * w} ${-0.46 * h}`} fill="none" stroke={SEP} strokeWidth={0.8} opacity={0.8} />
      {lid && <path d={`M${-0.3 * w} ${-h} Q0 ${-h - 0.28 * w} ${0.3 * w} ${-h} Z`} fill="currentColor" />}
    </g>
  );
}

/** Wood fire with flickering flames, logs crossed underneath. */
export function Fire({ x, y = 100, s = 1 }: { x: number; y?: number; s?: number }) {
  const f1 = "M-6 -5 C-8 -11 -3 -14 -2 -21 C0 -16 4 -14 3 -9 C6 -11 7 -8 6 -5 Z";
  const f2 = "M-6 -5 C-9 -10 -4 -15 -1 -19 C1 -15 5 -12 3 -8 C7 -10 7 -7 6 -5 Z";
  const f3 = "M-6 -5 C-7 -12 -2 -13 -3 -23 C1 -17 3 -15 4 -10 C5 -12 8 -8 6 -5 Z";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-13 -0.5 L11 -8 M13 -0.5 L-11 -8" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round" />
      <path d={f1} fill="currentColor" opacity={0.9}>
        <animate attributeName="d" values={`${f1};${f2};${f3};${f1}`} dur="0.9s" repeatCount="indefinite" />
      </path>
      <path d={f2} fill="currentColor" opacity={0.55} transform="translate(5 1) scale(.7)">
        <animate attributeName="d" values={`${f3};${f1};${f2};${f3}`} dur="1.1s" repeatCount="indefinite" />
      </path>
      <path d={f3} fill="currentColor" opacity={0.55} transform="translate(-5 1) scale(.65)">
        <animate attributeName="d" values={`${f2};${f3};${f1};${f2}`} dur="1s" repeatCount="indefinite" />
      </path>
    </g>
  );
}

/** Rising, fading steam wisps. */
export function Steam({ x, y, n = 3, gap = 6 }: { x: number; y: number; n?: number; gap?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: n }).map((_, i) => (
        <path key={i} d="M0 0 C-3 -4 3 -7 0 -11 C-3 -15 3 -18 0 -22" transform={`translate(${(i - (n - 1) / 2) * gap} 0)`} fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" opacity={0}>
          <animate attributeName="opacity" values="0;.85;0" dur="2.8s" begin={`${i * 0.9}s`} repeatCount="indefinite" />
          <Shift vals={[[0, 2], [0, -8]]} dur="2.8s" begin={`${i * 0.9}s`} linear />
        </path>
      ))}
    </g>
  );
}

/** Drops falling from a to b. */
export function Drops({ from, to, n = 2, dur = 0.9, r = 1.1 }: { from: Pt; to: Pt; n?: number; dur?: number; r?: number }) {
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => (
        <circle key={i} cx={from[0]} cy={from[1]} r={r} fill="currentColor" opacity={0}>
          <animate attributeName="cy" values={`${from[1]};${to[1]}`} dur={`${dur}s`} begin={`${(i * dur) / n}s`} repeatCount="indefinite" />
          <animate attributeName="cx" values={`${from[0]};${to[0]}`} dur={`${dur}s`} begin={`${(i * dur) / n}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.85;1" dur={`${dur}s`} begin={`${(i * dur) / n}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </g>
  );
}

/** A flowing pour stream along a path. */
export function Stream({ d, w = 1.6 }: { d: string; w?: number }) {
  return (
    <path d={d} fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeDasharray="3.5 2.5">
      <animate attributeName="stroke-dashoffset" values="12;0" dur="0.5s" repeatCount="indefinite" />
    </path>
  );
}

/** A little bee flying along a looping path. */
export function Bee({ path, dur, begin = "0s" }: { path: string; dur: string; begin?: string }) {
  return (
    <g>
      <ellipse rx={2.4} ry={1.5} fill="currentColor" />
      <ellipse cx={-0.4} cy={-1.8} rx={1.3} ry={1.9} fill="currentColor" opacity={0.5}>
        <animate attributeName="ry" values="1.9;0.6;1.9" dur="0.12s" repeatCount="indefinite" />
      </ellipse>
      <animateMotion path={path} dur={dur} begin={begin} rotate="auto" repeatCount="indefinite" />
    </g>
  );
}

/** A flower on a stem that sways. */
export function Flower({ x, y = 100, h = 16, begin = "0s", mustard = false }: { x: number; y?: number; h?: number; begin?: string; mustard?: boolean }) {
  return (
    <g>
      <path d={`M${x} ${y} C${x - 1} ${y - h * 0.5} ${x + 1} ${y - h * 0.8} ${x} ${y - h}`} fill="none" stroke="currentColor" strokeWidth={1.1} />
      <path d={`M${x} ${y - h * 0.35} C${x + 3} ${y - h * 0.45} ${x + 5} ${y - h * 0.4} ${x + 6} ${y - h * 0.3} C${x + 4} ${y - h * 0.25} ${x + 2} ${y - h * 0.3} ${x} ${y - h * 0.35} Z`} fill="currentColor" />
      {mustard ? (
        [[-2, -1], [2, -2], [0, -4], [-3, -4], [3, -5]].map(([dx, dy], i) => <circle key={i} cx={x + dx} cy={y - h + dy} r={1.4} fill="currentColor" />)
      ) : (
        <>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={x} cy={y - h - 2.6} rx={1.6} ry={2.6} fill="currentColor" transform={`rotate(${a} ${x} ${y - h})`} />
          ))}
          <circle cx={x} cy={y - h} r={1.5} fill={SEP} />
        </>
      )}
      <Swing vals={[-5, 5, -5]} at={[x, y]} dur="3.2s" begin={begin} />
    </g>
  );
}

/** A tuft of grass that sways. */
export function Grass({ x, y = 100, begin = "0s" }: { x: number; y?: number; begin?: string }) {
  return (
    <g>
      <path d={`M${x} ${y} Q${x - 3} ${y - 5} ${x - 5} ${y - 8} M${x} ${y} Q${x} ${y - 6} ${x + 0.5} ${y - 10} M${x} ${y} Q${x + 3} ${y - 4} ${x + 5} ${y - 7}`} fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" />
      <Swing vals={[-6, 6, -6]} at={[x, y]} dur="2.6s" begin={begin} />
    </g>
  );
}
