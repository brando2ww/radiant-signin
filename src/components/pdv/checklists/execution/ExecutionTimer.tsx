import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutionTimerProps {
  startedAt: string;
  maxMinutes: number;
}

export function ExecutionTimer({ startedAt, maxMinutes }: ExecutionTimerProps) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const calc = () => {
      const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
      const total = maxMinutes * 60;
      setRemaining(Math.max(0, total - elapsed));
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [startedAt, maxMinutes]);

  const totalSeconds = maxMinutes * 60;
  const pct = totalSeconds > 0 ? remaining / totalSeconds : 1;
  const mins = Math.floor(remaining / 60);
  const secs = Math.floor(remaining % 60);

  const isUrgent = pct < 0.2;
  const isExpired = remaining <= 0;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm font-mono px-2 py-1 rounded-md",
        isExpired
          ? "bg-destructive/10 text-destructive"
          : isUrgent
          ? "bg-orange-500/10 text-orange-600"
          : "bg-muted text-muted-foreground"
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      <span>
        {isExpired
          ? "Tempo esgotado"
          : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`}
      </span>
    </div>
  );
}
