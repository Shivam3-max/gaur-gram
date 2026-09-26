/**
 * Illustrated pack shots in Gaurgram's glass and clay packaging.
 * Used until real product photography is uploaded from admin.
 */
type Props = {
  pack: string;
  liquid: string;
  label?: string;
  title?: string;
  sub?: string;
  className?: string;
};

function shade(hex: string, amt: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  const r = c((n >> 16) & 255), g = c((n >> 8) & 255), b = c(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export default function PackShot({ pack, liquid, label = "#1c1a15", title = "", sub = "", className }: Props) {
  const id = `${pack}${liquid.slice(1)}${label.slice(1)}`;
  const light = shade(liquid, 0.08);
  const dark = shade(liquid, -0.12);

  const renderLabel = ({ x, y, w, h, t = 18 }: { x: number; y: number; w: number; h: number; t?: number }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill="#fffdf8" stroke={label} strokeOpacity={0.18} />
      <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} rx={2} fill="none" stroke={label} strokeOpacity={0.25} strokeWidth={0.6} />
      <text x={x + w / 2} y={y + 15} textAnchor="middle" fontSize={6.6} letterSpacing={2.4} fill={label} style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
        GAURGRAM
      </text>
      <line x1={x + w / 2 - 10} x2={x + w / 2 + 10} y1={y + 20} y2={y + 20} stroke="#c48a1c" strokeWidth={0.8} />
      <text x={x + w / 2} y={y + h / 2 + 9} textAnchor="middle" fontSize={t} fill={label} style={{ fontFamily: "var(--font-deva)" }}>
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h - 8} textAnchor="middle" fontSize={6} letterSpacing={1} fill={label} fillOpacity={0.7} style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
          {sub.toUpperCase()}
        </text>
      )}
    </g>
  );

  const defs = (
    <defs>
      <linearGradient id={`liq${id}`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor={dark} />
        <stop offset="0.35" stopColor={light} />
        <stop offset="0.7" stopColor={liquid} />
        <stop offset="1" stopColor={dark} />
      </linearGradient>
      <linearGradient id={`glass${id}`} x1="0" x2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
        <stop offset="0.12" stopColor="#fff" stopOpacity="0.1" />
        <stop offset="0.85" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#fff" stopOpacity="0.35" />
      </linearGradient>
      <linearGradient id={`brass${id}`} x1="0" x2="1">
        <stop offset="0" stopColor="#9a7229" />
        <stop offset="0.3" stopColor="#e6c16f" />
        <stop offset="0.6" stopColor="#b98d3b" />
        <stop offset="1" stopColor="#8a6423" />
      </linearGradient>
      <linearGradient id={`clay${id}`} x1="0" x2="1">
        <stop offset="0" stopColor="#8c4526" />
        <stop offset="0.35" stopColor="#c47a4f" />
        <stop offset="0.7" stopColor="#a95c36" />
        <stop offset="1" stopColor="#7d3c20" />
      </linearGradient>
      <radialGradient id={`shadow${id}`}>
        <stop offset="0" stopColor="#3c2a0a" stopOpacity="0.22" />
        <stop offset="1" stopColor="#3c2a0a" stopOpacity="0" />
      </radialGradient>
    </defs>
  );

  const shadow = <ellipse cx={100} cy={242} rx={74} ry={9} fill={`url(#shadow${id})`} />;

  let body: React.ReactNode = null;

  if (pack === "bottle") {
    const path = "M82 44 H118 V64 C118 80 142 90 142 112 V222 a14 14 0 0 1 -14 14 H72 a14 14 0 0 1 -14 -14 V112 C58 90 82 80 82 64 Z";
    body = (
      <g>
        <clipPath id={`clipB${id}`}><path d={path} /></clipPath>
        <g clipPath={`url(#clipB${id})`}>
          <rect x={50} y={66} width={100} height={180} fill={`url(#liq${id})`} />
          <ellipse cx={100} cy={66} rx={30} ry={3} fill={light} />
        </g>
        <path d={path} fill={`url(#glass${id})`} stroke="#1c1a15" strokeOpacity={0.14} strokeWidth={1.2} />
        <rect x={66} y={116} width={6} height={96} rx={3} fill="#fff" opacity={0.6} />
        <rect x={78} y={28} width={44} height={18} rx={4} fill={label} />
        <rect x={78} y={40} width={44} height={6} rx={2} fill="#000" opacity={0.15} />
        {renderLabel({ x: 66, y: 140, w: 68, h: 62, t: 17 })}
      </g>
    );
  } else if (pack === "oil") {
    const path = "M92 34 H108 V72 C108 88 132 92 132 112 V224 a12 12 0 0 1 -12 12 H80 a12 12 0 0 1 -12 -12 V112 C68 92 92 88 92 72 Z";
    body = (
      <g>
        <clipPath id={`clipO${id}`}><path d={path} /></clipPath>
        <g clipPath={`url(#clipO${id})`}>
          <rect x={60} y={80} width={80} height={170} fill={`url(#liq${id})`} opacity={0.92} />
        </g>
        <path d={path} fill={`url(#glass${id})`} stroke="#1c1a15" strokeOpacity={0.16} strokeWidth={1.2} />
        <rect x={75} y={112} width={5} height={104} rx={2.5} fill="#fff" opacity={0.55} />
        <rect x={89} y={14} width={22} height={22} rx={3} fill="#a0703f" />
        <path d="M89 30 h22" stroke="#6f4a26" strokeWidth={1.5} />
        <path d="M92 42 q8 6 16 0" stroke="#c48a1c" strokeWidth={1.4} fill="none" />
        {renderLabel({ x: 73, y: 140, w: 54, h: 66, t: 14 })}
      </g>
    );
  } else if (pack === "honey") {
    const path = "M50 96 Q50 88 58 88 H142 Q150 88 150 96 V222 a14 14 0 0 1 -14 14 H64 a14 14 0 0 1 -14 -14 Z";
    body = (
      <g>
        <clipPath id={`clipH${id}`}><path d={path} /></clipPath>
        <g clipPath={`url(#clipH${id})`}>
          <rect x={44} y={100} width={112} height={140} fill={`url(#liq${id})`} />
        </g>
        <path d={path} fill={`url(#glass${id})`} stroke="#1c1a15" strokeOpacity={0.16} strokeWidth={1.2} />
        <rect x={58} y={104} width={7} height={112} rx={3.5} fill="#fff" opacity={0.5} />
        {/* cloth cap tied with twine */}
        <path d="M46 70 L154 70 L160 96 L148 90 L136 100 L124 90 L112 100 L100 90 L88 100 L76 90 L64 100 L52 90 L40 96 Z" fill="#f4ecd9" stroke="#1c1a15" strokeOpacity={0.12} />
        <path d="M46 70 L154 70 L160 96 L148 90 L136 100 L124 90 L112 100 L100 90 L88 100 L76 90 L64 100 L52 90 L40 96 Z" fill="none" stroke="#9a5a36" strokeOpacity={0.25} strokeDasharray="3 3" />
        <rect x={50} y={56} width={100} height={18} rx={5} fill="#a8743f" />
        <path d="M48 84 Q100 92 152 84" stroke="#8a6a3a" strokeWidth={2} fill="none" />
        <circle cx={150} cy={86} r={3} fill="#8a6a3a" />
        <path d="M150 86 l6 14 M150 86 l-2 15" stroke="#8a6a3a" strokeWidth={1.4} />
        <g transform="translate(100 164)">
          <path d="M0 -36 L31 -18 L31 18 L0 36 L-31 18 L-31 -18 Z" fill="#fffdf8" stroke={label} strokeOpacity={0.2} />
          <text y={-14} textAnchor="middle" fontSize={6} letterSpacing={2} fill={label} style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>GAURGRAM</text>
          <text y={9} textAnchor="middle" fontSize={16} fill={label} style={{ fontFamily: "var(--font-deva)" }}>{title}</text>
          {sub && <text y={24} textAnchor="middle" fontSize={5.6} letterSpacing={1} fill={label} fillOpacity={0.7} style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>{sub.toUpperCase()}</text>}
        </g>
      </g>
    );
  } else if (pack === "kulhad") {
    body = (
      <g>
        <path d="M46 112 L60 226 Q62 236 74 236 H126 Q138 236 140 226 L154 112 Z" fill={`url(#clay${id})`} />
        <path d="M52 150 Q100 158 148 150" stroke="#6d3419" strokeOpacity={0.35} strokeWidth={1} fill="none" />
        <path d="M56 186 Q100 194 144 186" stroke="#6d3419" strokeOpacity={0.3} strokeWidth={1} fill="none" />
        <ellipse cx={100} cy={112} rx={54} ry={13} fill="#b76a42" />
        <ellipse cx={100} cy={112} rx={48} ry={10} fill={liquid} />
        <ellipse cx={92} cy={110} rx={22} ry={4} fill="#fff" opacity={0.35} />
        {[[82, 111, "#6f9a3e"], [110, 108, "#6f9a3e"], [99, 115, "#6f9a3e"], [120, 114, "#e8d9b5"], [74, 115, "#e8d9b5"], [104, 109, "#c1662b"]].map(([x, y, c], i) => (
          <ellipse key={i} cx={x as number} cy={y as number} rx={3.4} ry={1.5} fill={c as string} transform={`rotate(${i * 37} ${x} ${y})`} />
        ))}
        <circle cx={100} cy={178} r={17} fill="none" stroke="#f7e3cf" strokeOpacity={0.55} strokeWidth={1.2} />
        <text x={100} y={184} textAnchor="middle" fontSize={15} fill="#f7e3cf" fillOpacity={0.85} style={{ fontFamily: "var(--font-deva)" }}>गौ</text>
      </g>
    );
  } else if (pack === "matka") {
    body = (
      <g>
        <path d="M66 96 C34 122 36 202 72 228 Q100 244 128 228 C164 202 166 122 134 96 Z" fill={`url(#clay${id})`} />
        <path d="M44 160 Q100 176 156 160" stroke="#6d3419" strokeOpacity={0.3} fill="none" />
        <path d="M50 190 Q100 204 150 190" stroke="#f7e3cf" strokeOpacity={0.35} strokeDasharray="2 4" fill="none" />
        <ellipse cx={100} cy={92} rx={40} ry={9} fill="#9d5533" />
        {/* muslin cover */}
        <path d="M54 94 Q100 60 146 94 L150 118 Q138 110 128 118 Q116 108 104 118 Q92 108 80 118 Q68 110 50 118 Z" fill="#fbf7ee" stroke="#1c1a15" strokeOpacity={0.1} />
        <path d="M58 104 Q100 110 142 104" stroke="#9a5a36" strokeWidth={2.2} fill="none" />
        <path d="M142 104 l10 22" stroke="#9a5a36" strokeWidth={1.4} />
        <rect x={146} y={124} width={22} height={14} rx={2} fill="#fffdf8" stroke="#1c1a15" strokeOpacity={0.2} transform="rotate(12 157 131)" />
        <text x={157} y={134} textAnchor="middle" fontSize={7} fill={label} transform="rotate(12 157 131)" style={{ fontFamily: "var(--font-deva)" }}>{title}</text>
        <circle cx={100} cy={176} r={19} fill="none" stroke="#f7e3cf" strokeOpacity={0.5} strokeWidth={1.2} />
        <text x={100} y={182} textAnchor="middle" fontSize={15} fill="#f7e3cf" fillOpacity={0.85} style={{ fontFamily: "var(--font-deva)" }}>गौ</text>
      </g>
    );
  } else {
    // jar (ghee, makhan, paneer, glass-set dahi)
    const path = "M52 78 Q52 70 60 70 H140 Q148 70 148 78 V218 a18 18 0 0 1 -18 18 H70 a18 18 0 0 1 -18 -18 Z";
    body = (
      <g>
        <clipPath id={`clipJ${id}`}><path d={path} /></clipPath>
        <g clipPath={`url(#clipJ${id})`}>
          <rect x={46} y={86} width={108} height={160} fill={`url(#liq${id})`} />
          <ellipse cx={100} cy={86} rx={48} ry={4} fill={light} />
          {Array.from({ length: 26 }).map((_, i) => (
            <circle key={i} cx={58 + ((i * 37) % 86)} cy={96 + ((i * 53) % 130)} r={1.1} fill={dark} opacity={0.35} />
          ))}
        </g>
        <path d={path} fill={`url(#glass${id})`} stroke="#1c1a15" strokeOpacity={0.14} strokeWidth={1.2} />
        <rect x={60} y={92} width={7} height={122} rx={3.5} fill="#fff" opacity={0.55} />
        <rect x={56} y={60} width={88} height={12} rx={2} fill="#1c1a15" opacity={0.08} />
        <rect x={48} y={36} width={104} height={28} rx={6} fill={`url(#brass${id})`} />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <line key={i} x1={54 + i * 7.6} x2={54 + i * 7.6} y1={40} y2={60} stroke="#6b4c16" strokeOpacity={0.25} />
        ))}
        {renderLabel({ x: 60, y: 120, w: 80, h: 74, t: 20 })}
      </g>
    );
  }

  return (
    <svg viewBox="0 0 200 260" className={className} role="img" aria-label={`${title} ${sub}`.trim() || "Gaurgram pack"}>
      {defs}
      {shadow}
      {body}
    </svg>
  );
}
