import { Bee, Cow, Drops, Fire, Flower, Grass, Man, Matka, SEP, Shift, Spin, Steam, Stream, Swing, Woman } from "./kit";

export type SceneKey =
  | "milking"
  | "carry"
  | "boiling"
  | "pouring"
  | "bilona"
  | "cooking"
  | "jars"
  | "cycle"
  | "bees"
  | "kolhu"
  | "grazing"
  | "sowing"
  | "churn";

type Scene = { w: number; hindi: string; label: string; draw: () => React.ReactNode };

function Ladle({ from, to }: { from: [number, number]; to: [number, number] }) {
  return (
    <g>
      <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      <circle cx={to[0]} cy={to[1]} r={2.4} fill="currentColor" />
    </g>
  );
}

export const SCENES: Record<SceneKey, Scene> = {
  milking: {
    w: 150,
    hindi: "दुहना",
    label: "Hand milking at dawn",
    draw: () => (
      <>
        <g opacity={0.82}>
          <Cow x={108} />
        </g>
        <Woman x={52} squat lean={24} hands={[[28, -13], [26, -11]]} armAnim={{ vals: [0, 5, 0], dur: "0.7s" }} />
        <Matka x={82} w={12} h={8} />
        <Stream d="M83.4 90.6 L82.4 93.4" w={1.1} />
        <Grass x={20} />
        <Grass x={32} begin="-1s" />
        <Grass x={146} begin="-.5s" />
      </>
    ),
  },

  carry: {
    w: 60,
    hindi: "लाना",
    label: "Carrying milk from the shed",
    draw: () => (
      <g>
        <Woman
          x={30}
          walk
          hands={[[5.5, -63], [3, -30]]}
          held={
            <>
              <Matka x={1.5} y={-58.6} w={13} h={9.5} />
              <Matka x={1.5} y={-67.6} w={9} h={7} />
            </>
          }
        />
        <Grass x={8} />
        <Grass x={54} begin="-1.2s" />
        <Shift vals={[[0, 0], [0, -1.2], [0, 0]]} dur="0.9s" />
      </g>
    ),
  },

  boiling: {
    w: 100,
    hindi: "उबालना",
    label: "Boiling milk on a wood fire",
    draw: () => (
      <>
        <Fire x={66} />
        <Woman
          x={30}
          lean={20}
          hands={[[22, -36], [20, -33]]}
          armAnim={{ vals: [-5, 6, -5], dur: "1.8s" }}
          held={<Ladle from={[22, -36]} to={[36, -16]} />}
        />
        <path d="M53 92 L52 74 Q66 70 80 74 L79 92 Q66 95 53 92 Z" fill="currentColor" stroke={SEP} strokeWidth={1.3} paintOrder="stroke" />
        <path d="M50.5 74 Q66 69.5 81.5 74" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        <Steam x={66} y={69} />
      </>
    ),
  },

  pouring: {
    w: 90,
    hindi: "जमाना",
    label: "Setting curd in clay",
    draw: () => (
      <>
        <Woman
          x={26}
          lean={28}
          hands={[[22, -44], [20, -40]]}
          held={
            <g transform="translate(23 -44) rotate(115)">
              <Matka x={0} y={4} w={10} h={9} />
            </g>
          }
        />
        <Stream d="M56.5 59 C59.5 64 61.2 71 61.6 80" w={1.5} />
        <Matka x={62} w={24} h={20} />
        <Grass x={84} begin="-.8s" />
      </>
    ),
  },

  bilona: {
    w: 120,
    hindi: "बिलोना",
    label: "Churning curd in the bilona",
    draw: () => (
      <>
        <line x1={60} y1={80} x2={60} y2={17} stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={60} cy={14.5} r={2.3} fill="currentColor" />
        <g transform="translate(60 0)">
          <g>
            <line x1={-10} y1={24} x2={10} y2={24} stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
            <animateTransform attributeName="transform" type="scale" additive="sum" values="1 1;-1 1;1 1" dur="1.3s" repeatCount="indefinite" />
          </g>
        </g>
        <path d="M57 45 L63 47 M57 49 L63 51 M57 53 L63 55" stroke="currentColor" strokeWidth={1.2} />
        <Woman x={36} lean={10} hands={[[21, -50], [21, -46]]} armAnim={{ vals: [-9, 8, -9], dur: "1.3s" }} />
        <Woman x={84} flip lean={10} hands={[[21, -50], [21, -46]]} armAnim={{ vals: [8, -9, 8], dur: "1.3s" }} />
        <Matka x={60} w={36} h={26} />
        <ellipse cx={60} cy={75} rx={8} ry={1.6} fill="none" stroke={SEP} strokeWidth={0.9} strokeDasharray="3 3">
          <animate attributeName="stroke-dashoffset" values="0;12" dur="0.8s" repeatCount="indefinite" />
        </ellipse>
      </>
    ),
  },

  cooking: {
    w: 110,
    hindi: "पकाना",
    label: "Slow-cooking makhan into ghee",
    draw: () => (
      <>
        <Fire x={70} s={0.95} />
        <Woman
          x={34}
          lean={22}
          hands={[[24, -36], [22, -33]]}
          armAnim={{ vals: [-7, 7, -7], dur: "2s" }}
          held={<Ladle from={[24, -36]} to={[39, -20]} />}
        />
        <path d="M50 80 Q70 99 90 80 Z" fill="currentColor" stroke={SEP} strokeWidth={1.3} paintOrder="stroke" />
        <line x1={48} y1={80} x2={92} y2={80} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        <circle cx={47} cy={80} r={2.2} fill="none" stroke="currentColor" strokeWidth={1.2} />
        <circle cx={93} cy={80} r={2.2} fill="none" stroke="currentColor" strokeWidth={1.2} />
        {[62, 70, 78].map((cx, i) => (
          <circle key={cx} cx={cx} cy={78.6} r={0} fill="currentColor">
            <animate attributeName="r" values="0;1.5;0" dur="1.4s" begin={`${i * 0.45}s`} repeatCount="indefinite" />
          </circle>
        ))}
        <Steam x={70} y={74} n={2} gap={8} />
      </>
    ),
  },

  jars: {
    w: 110,
    hindi: "भरना",
    label: "Filling ghee into glass jars",
    draw: () => (
      <>
        <rect x={46} y={88} width={60} height={3} fill="currentColor" />
        <path d="M50 91 L50 100 M102 91 L102 100" stroke="currentColor" strokeWidth={2} />
        {[58, 76, 94].map((x, i) => (
          <g key={x}>
            <rect x={x - 6} y={72} width={12} height={16} rx={2} fill="currentColor" opacity={0.28} stroke="currentColor" strokeWidth={1} />
            <rect x={x - 5} y={75} width={10} height={12.5} rx={1.2} fill="currentColor" opacity={0.85}>
              {i === 0 && (
                <>
                  <animate attributeName="y" values="86;75;75" keyTimes="0;.8;1" dur="3.4s" repeatCount="indefinite" />
                  <animate attributeName="height" values="1.5;12.5;12.5" keyTimes="0;.8;1" dur="3.4s" repeatCount="indefinite" />
                </>
              )}
            </rect>
            {i > 0 && <rect x={x - 6.5} y={69} width={13} height={3.4} rx={1} fill="currentColor" />}
          </g>
        ))}
        <Woman
          x={32}
          lean={18}
          hands={[[22, -40], [20, -37]]}
          held={
            <g transform="translate(23 -40) rotate(112)">
              <Matka x={0} y={4} w={9} h={8} />
            </g>
          }
        />
        <Stream d="M59.4 64.5 C59.5 67 59 70 58.3 76" w={1.4} />
      </>
    ),
  },

  cycle: {
    w: 130,
    hindi: "पहुँचाना",
    label: "At your door by 7 AM",
    draw: () => (
      <>
        {[60, 70, 80].map((y, i) => (
          <line key={y} x1={4} y1={y} x2={16} y2={y} stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" opacity={0}>
            <animate attributeName="opacity" values="0;.8;0" dur="0.9s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            <Shift vals={[[6, 0], [-4, 0]]} dur="0.9s" begin={`${i * 0.3}s`} linear />
          </line>
        ))}
        <g>
          {[30, 94].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={88} r={11} fill="none" stroke="currentColor" strokeWidth={2.2} />
              <g>
                {[0, 45, 90, 135].map((a) => (
                  <line key={a} x1={cx - 10} y1={88} x2={cx + 10} y2={88} stroke="currentColor" strokeWidth={0.7} transform={`rotate(${a} ${cx} 88)`} />
                ))}
                <Spin at={[cx, 88]} dur="0.8s" />
              </g>
              <circle cx={cx} cy={88} r={1.6} fill="currentColor" />
            </g>
          ))}
          <path d="M30 88 L58 88 L52 67 Z M52 67 L86 66 L58 88 M86 66 L94 88 M86 66 L84 58 L91 57 M26 70 L48 70 M30 88 L28 70" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinejoin="round" strokeLinecap="round" />
          <path d="M47 64.5 Q53 62.5 57 64.5" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" fill="none" />
          <g>
            <line x1={58} y1={83} x2={58} y2={93} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
            <Spin at={[58, 88]} dur="0.8s" />
          </g>
          {[29, 39].map((x) => (
            <g key={x} stroke={SEP} strokeWidth={1.1} paintOrder="stroke">
              <rect x={x - 4} y={55} width={8} height={15} rx={1.8} fill="currentColor" />
              <rect x={x - 2.4} y={52} width={4.8} height={3.4} rx={0.8} fill="currentColor" />
            </g>
          ))}
          <rect x={87} y={57} width={14} height={8} rx={1} fill="currentColor" stroke={SEP} strokeWidth={1.1} paintOrder="stroke" />
          {[90, 94, 98].map((x) => <rect key={x} x={x - 1.2} y={52} width={2.4} height={5} rx={0.8} fill="currentColor" />)}
          {/* rider */}
          <path d="M50 64 L55.5 62.5 L63 45 L57.5 43 Z" fill="currentColor" stroke={SEP} strokeWidth={1.2} paintOrder="stroke" />
          <path d="M53 63 L62 71 L58 86" fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="d" values="M53 63 L62 71 L58 86;M53 63 L63.5 74 L62 90.5;M53 63 L61 76 L58 90;M53 63 L60 72 L54 87;M53 63 L62 71 L58 86" dur="0.8s" repeatCount="indefinite" />
          </path>
          <path d="M60.5 46 Q73 49 86 58" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
          <circle cx={62.5} cy={39.5} r={4.4} fill="currentColor" stroke={SEP} strokeWidth={1.2} paintOrder="stroke" />
          <path d="M57.8 38.6 C57 32.6 64.6 30 68.2 36.2 C66.2 34.8 62.4 34.6 57.8 38.6 Z" fill="currentColor" />
          <Shift vals={[[0, 0], [0, -0.8], [0, 0]]} dur="0.4s" />
        </g>
      </>
    ),
  },

  bees: {
    w: 110,
    hindi: "शहद",
    label: "Bees at our farm-edge hives",
    draw: () => (
      <>
        <path d="M31 100 L33 86 M52 100 L50 86" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        <rect x={26} y={84} width={30} height={2.6} fill="currentColor" />
        <rect x={28} y={68} width={26} height={16} rx={1} fill="currentColor" stroke={SEP} strokeWidth={1.2} paintOrder="stroke" />
        <rect x={29} y={55} width={24} height={13} rx={1} fill="currentColor" stroke={SEP} strokeWidth={1.2} paintOrder="stroke" />
        <path d="M24.5 55 L57.5 55 L53 48 L29 48 Z" fill="currentColor" />
        <rect x={36} y={80.5} width={10} height={1.8} rx={0.9} fill={SEP} />
        <line x1={29} y1={62} x2={53} y2={62} stroke={SEP} strokeWidth={0.7} />
        <line x1={28} y1={75} x2={54} y2={75} stroke={SEP} strokeWidth={0.7} />
        <Flower x={72} h={18} />
        <Flower x={84} h={24} mustard begin="-1s" />
        <Flower x={96} h={14} begin="-2s" />
        <Flower x={104} h={20} mustard begin="-.5s" />
        <Bee path="M41 82 C50 62 66 66 72 80 C76 90 56 96 41 82" dur="4.5s" />
        <Bee path="M41 82 C52 50 80 52 84 74 C86 86 60 92 41 82" dur="5.5s" begin="-2s" />
        <Bee path="M41 82 C60 40 100 50 97 84 C94 96 60 98 41 82" dur="6.5s" begin="-3s" />
        <Bee path="M41 60 C30 40 60 30 62 46 C63 58 48 66 41 60" dur="4s" begin="-1s" />
      </>
    ),
  },

  kolhu: {
    w: 150,
    hindi: "कोल्हू",
    label: "Wood-pressing oil in the kolhu",
    draw: () => (
      <>
        <path d="M10 100 C8 90 12 84 17 84 C22 84 26 90 24 100 Z" fill="currentColor" />
        <path d="M14 85 L17 81 L20 85" fill="none" stroke="currentColor" strokeWidth={1.2} />
        <path d="M64 100 L86 100 L83 66 L67 66 Z" fill="currentColor" stroke={SEP} strokeWidth={1.3} paintOrder="stroke" />
        <rect x={64.5} y={63} width={21} height={3.6} rx={1} fill="currentColor" />
        <line x1={75} y1={64} x2={79} y2={30} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
        <path d="M86 91 L91 91" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        <Stream d="M91 91.5 C92.5 92 93.4 93.6 93.8 95.5" w={1.1} />
        <Matka x={94} w={10} h={5} />
        <g>
          <line x1={77} y1={52} x2={35} y2={77} stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <animate attributeName="x2" values="35;115;35" dur="9s" repeatCount="indefinite" />
          </line>
          <g>
            <g>
              <Cow x={0} scale={0.5} udder={false} begin="-1s" />
              <animateTransform attributeName="transform" type="scale" values="1 1;-1 1" keyTimes="0;.5" calcMode="discrete" dur="9s" repeatCount="indefinite" />
            </g>
            <animateTransform attributeName="transform" type="translate" values="35 0;115 0;35 0" dur="9s" repeatCount="indefinite" />
          </g>
          <animate attributeName="opacity" values="1;.72" keyTimes="0;.5" calcMode="discrete" dur="9s" repeatCount="indefinite" />
        </g>
      </>
    ),
  },

  grazing: {
    w: 150,
    hindi: "चरना",
    label: "Grazing in the open",
    draw: () => (
      <>
        <Cow x={30} scale={0.55} horns={false} udder={false} begin="-1.3s" />
        <Cow x={92} begin="-.4s" />
        <Grass x={10} />
        <Grass x={60} begin="-1s" />
        <Grass x={116} begin="-.6s" />
        <Grass x={140} begin="-1.6s" />
        <Flower x={147} h={10} begin="-.8s" />
      </>
    ),
  },

  sowing: {
    w: 100,
    hindi: "बुवाई",
    label: "Farmers sowing mustard",
    draw: () => (
      <>
        <path d="M2 99 Q20 96 38 99 T74 99 T98 99" fill="none" stroke="currentColor" strokeWidth={1.2} />
        <Man x={34} lean={6} stride={3} hands={[[18, -54]]} armAnim={{ vals: [-28, 18, -28], dur: "2.2s" }}>
          <path d="M3.4 -45.6 Q8 -38 8 -31" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
          <path d="M3 -46 L9 -30" stroke="currentColor" strokeWidth={0.9} />
          <path d="M4.5 -32 L12.5 -32 L11.5 -23 Q8.5 -21 5.5 -23 Z" fill="currentColor" stroke={SEP} strokeWidth={1.1} paintOrder="stroke" />
        </Man>
        {[
          "M53 46 Q63 50 70 98",
          "M53 46 Q66 56 77 98",
          "M52 47 Q58 60 63 98",
          "M53 46 Q70 50 84 98",
        ].map((p, i) => (
          <circle key={p} r={1} fill="currentColor" opacity={0}>
            <animateMotion path={p} dur="2.2s" begin={`${0.9 + i * 0.12}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.5;.6" dur="2.2s" begin={`${0.9 + i * 0.12}s`} repeatCount="indefinite" />
          </circle>
        ))}
        {[84, 91, 97].map((x, i) => (
          <g key={x}>
            <path d={`M${x} 99 L${x} 92 M${x} 94 Q${x - 4} 91 ${x - 5} 92.5 Q${x - 3} 95 ${x} 94 M${x} 93 Q${x + 4} 89 ${x + 5} 90.5 Q${x + 3} 93.5 ${x} 93`} fill="currentColor" stroke="currentColor" strokeWidth={0.9} />
            <Swing vals={[-5, 5, -5]} at={[x, 99]} dur="2.8s" begin={`${-i * 0.7}s`} />
          </g>
        ))}
      </>
    ),
  },

  churn: {
    w: 130,
    hindi: "मथना",
    label: "Churning makhan by hand",
    draw: () => (
      <>
        <g opacity={0.55}>
          <Cow x={36} scale={0.7} begin="-2s" />
        </g>
        <Woman x={96} flip lean={12} hands={[[22, -54], [22, -46]]} armAnim={{ vals: [0, -7, 0], dur: "1.1s" }} />
        <g>
          <line x1={75} y1={76} x2={74} y2={26} stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
          <Shift vals={[[0, 0], [0, 4], [0, 0]]} dur="1.1s" />
        </g>
        <Matka x={78} w={40} h={32} />
        <Drops from={[70, 70]} to={[66, 64]} n={2} dur={1.1} r={0.9} />
      </>
    ),
  },
};
