import type { CampaignPrize } from "@/hooks/use-campaign-prizes";

interface RoulettePreviewProps {
  prizes: CampaignPrize[];
  size?: number;
}

export function RoulettePreview({ prizes, size = 200 }: RoulettePreviewProps) {
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

  const totalProb = prizes.reduce((s, p) => s + Number(p.probability), 0);
  let cumDeg = 0;
  const segments = prizes.map((p) => {
    const deg = totalProb > 0 ? (Number(p.probability) / totalProb) * 360 : 360 / prizes.length;
    const start = cumDeg;
    cumDeg += deg;
    return { ...p, startDeg: start, deg };
  });

  const gradient = segments
    .map((s) => `${s.color} ${s.startDeg}deg ${s.startDeg + s.deg}deg`)
    .join(", ");

  const r = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="rounded-full border-4 border-background shadow-lg"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${gradient})`,
        }}
      />
      {/* Labels */}
      {segments.map((s) => {
        const midAngle = ((s.startDeg + s.deg / 2) * Math.PI) / 180;
        const labelR = r * 0.65;
        const x = r + labelR * Math.sin(midAngle);
        const y = r - labelR * Math.cos(midAngle);
        const rotation = s.startDeg + s.deg / 2;
        return (
          <span
            key={s.id}
            className="absolute text-[9px] font-bold text-white drop-shadow-md pointer-events-none whitespace-nowrap"
            style={{
              left: x,
              top: y,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              maxWidth: r * 0.6,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {s.name}
          </span>
        );
      })}
      {/* Center circle */}
      <div
        className="absolute bg-background rounded-full shadow-md border-2 border-border"
        style={{
          width: size * 0.18,
          height: size * 0.18,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* Pointer */}
      <div
        className="absolute"
        style={{
          top: -8,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-primary" />
      </div>
    </div>
  );
}
