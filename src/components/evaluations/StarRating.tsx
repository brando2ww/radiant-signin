import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

export const StarRating = ({ value, onChange, size = "lg", readonly = false }: StarRatingProps) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverValue || value) >= star;
        
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={cn(
              "transition-all duration-200",
              !readonly && "hover:scale-110 cursor-pointer",
              readonly && "cursor-default"
            )}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            onClick={() => !readonly && onChange(star)}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors duration-200",
                isFilled 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "fill-transparent text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
