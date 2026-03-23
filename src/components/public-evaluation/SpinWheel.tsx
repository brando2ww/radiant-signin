import { useState, useRef } from "react";
import type { CampaignPrize } from "@/hooks/use-campaign-prizes";
import { pickPrize } from "@/hooks/use-campaign-prizes";

interface SpinWheelProps {
  prizes: CampaignPrize[];
  onResult: (prize: CampaignPrize) => void;
  disabled?: boolean;
}

export function SpinWheel({ prizes, onResult, disabled }: SpinWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const resultRef = useRef<CampaignPrize | null>(null);

  if (!prizes.length) return null;

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

  const handleSpin = () => {
    if (spinning || disabled) return;

    const winner = pickPrize(prizes);
    resultRef.current = winner;

    // Find the segment for the winner
    const seg = segments.find((s) => s.id === winner.id)!;
    // Target: the pointer is at top (0deg). We need the middle of the winning segment to end up at top.
    // The wheel rotates clockwise, so we need to rotate by (360 - midAngle) + extra full rotations
    const midAngle = seg.startDeg + seg.deg / 2;
    const targetAngle = 360 - midAngle;
    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
    const finalRotation = rotation + extraSpins * 360 + targetAngle + (Math.random() * seg.deg * 0.6 - seg.deg * 0.3);

    setSpinning(true);
    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      onResult(winner);
    }, 4200);
  };

  const size = 300;
  const r = size / 2;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Pointer at top */}
        <div className="absolute z-10" style={{ top: -12, left: "50%", transform: "translateX(-50%)" }}>
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-red-500 drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <div
          className="rounded-full border-[6px] border-yellow-400 shadow-2xl"
          style={{
            width: size,
            height: size,
            background: `conic-gradient(${gradient})`,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
          }}
        >
          {/* Segment labels */}
          {segments.map((s) => {
            const midAngle = ((s.startDeg + s.deg / 2) * Math.PI) / 180;
            const labelR = r * 0.62;
            const x = r + labelR * Math.sin(midAngle);
            const y = r - labelR * Math.cos(midAngle);
            const rot = s.startDeg + s.deg / 2;
            return (
              <span
                key={s.id}
                className="absolute text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] pointer-events-none text-center leading-tight"
                style={{
                  left: x,
                  top: y,
                  transform: `translate(-50%, -50%) rotate(${rot}deg)`,
                  maxWidth: r * 0.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {s.name}
              </span>
            );
          })}
        </div>

        {/* Center button */}
        <button
          onClick={handleSpin}
          disabled={spinning || disabled}
          className="absolute bg-white rounded-full shadow-xl border-4 border-yellow-400 font-bold text-xs text-primary hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
          style={{
            width: size * 0.22,
            height: size * 0.22,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {spinning ? "..." : "GIRAR"}
        </button>

        {/* Decorative dots around the wheel */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i * 18 * Math.PI) / 180;
          const dotR = r + 2;
          const dx = r + dotR * Math.sin(angle) - 4;
          const dy = r - dotR * Math.cos(angle) - 4;
          return (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${i % 2 === 0 ? "bg-yellow-300" : "bg-white"}`}
              style={{ left: dx, top: dy }}
            />
          );
        })}
      </div>

      {!spinning && (
        <button
          onClick={handleSpin}
          disabled={spinning || disabled}
          className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 animate-bounce"
        >
          🎡 Girar Roleta!
        </button>
      )}
    </div>
  );
}
