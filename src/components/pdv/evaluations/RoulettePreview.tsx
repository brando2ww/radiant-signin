import type { CampaignPrize } from "@/hooks/use-campaign-prizes";

const DEFAULT_PRIMARY = "#1a1a2e";
const DEFAULT_SECONDARY = "#722F37";

interface RoulettePreviewProps {
  prizes: CampaignPrize[];
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export function RoulettePreview({ prizes, size = 200, primaryColor, secondaryColor }: RoulettePreviewProps) {
  const pc = primaryColor || DEFAULT_PRIMARY;
  const sc = secondaryColor || DEFAULT_SECONDARY;

  if (!prizes.length) {
    return (
      <div
        className="rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs"
        style={{ width: size, height: size }}
      >
        Sem prêmios
      </div>
    );
  }

  const equalDeg = 360 / prizes.length;
  const segments = prizes.map((p, i) => ({
    ...p,
    startDeg: i * equalDeg,
    deg: equalDeg,
    wheelColor: i % 2 === 0 ? pc : sc,
  }));

  const r = size / 2;

  const svgSegments = segments.map((s) => {
    const startRad = ((s.startDeg - 90) * Math.PI) / 180;
    const endRad = ((s.startDeg + s.deg - 90) * Math.PI) / 180;
    const x1 = r + r * Math.cos(startRad);
    const y1 = r + r * Math.sin(startRad);
    const x2 = r + r * Math.cos(endRad);
    const y2 = r + r * Math.sin(endRad);
    const largeArc = s.deg > 180 ? 1 : 0;
    const path = `M ${r} ${r} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const midAngleDeg = s.startDeg + s.deg / 2;
    const midAngleRad = ((midAngleDeg - 90) * Math.PI) / 180;

    // Anchor the text just outside the center hole and let it grow toward the edge.
    // This uses the full readable length of the slice instead of centering on a small point.
    const innerR = r * 0.24;
    const outerR = r * 0.96;
    const usableLen = outerR - innerR;

    // Determine whether to flip the text 180° (left half), so it always reads upright.
    const needsFlip = midAngleDeg > 90 && midAngleDeg < 270;

    // For unflipped text, anchor at the inner radius and extend outward.
    // For flipped text, anchor at the outer radius and extend inward (visually identical direction).
    const anchorR = needsFlip ? outerR : innerR;
    const tx = r + anchorR * Math.cos(midAngleRad);
    const ty = r + anchorR * Math.sin(midAngleRad);

    let textRotation = midAngleDeg - 90;
    if (needsFlip) textRotation += 180;

    const fontSize = Math.max(9, Math.min(13, equalDeg / 3.2));

    // Truncate using both slice width AND radial length budget.
    const charBudget = Math.floor(usableLen / (fontSize * 0.55));
    const sliceBudget = Math.max(8, Math.floor(equalDeg / 2));
    const maxChars = Math.min(charBudget, sliceBudget);
    const label = s.name.length > maxChars ? s.name.slice(0, Math.max(3, maxChars - 1)) + "…" : s.name;

    return (
      <g key={s.id}>
        <path d={path} fill={s.wheelColor} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        <text
          x={tx}
          y={ty}
          textAnchor="start"
          dominantBaseline="central"
          transform={`rotate(${textRotation}, ${tx}, ${ty})`}
          fill="white"
          fontSize={fontSize}
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.9))" }}
        >
          {label}
        </text>
      </g>
    );
  });

  const centerSize = size * 0.18;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rounded-full"
        style={{ border: `3px solid #d4a843` }}
      >
        {svgSegments}
        {segments.map((s) => {
          const rad = ((s.startDeg - 90) * Math.PI) / 180;
          return (
            <line
              key={`line-${s.id}`}
              x1={r}
              y1={r}
              x2={r + r * Math.cos(rad)}
              y2={r + r * Math.sin(rad)}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
            />
          );
        })}
        <circle cx={r} cy={r} r={centerSize / 2} fill="white" stroke="#d4a843" strokeWidth="2" />
      </svg>
      <div
        className="absolute"
        style={{ top: -6, left: "50%", transform: "translateX(-50%)" }}
      >
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[13px] border-t-red-500" />
      </div>
    </div>
  );
}
