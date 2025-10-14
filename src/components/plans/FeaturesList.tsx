import { Check, X } from "lucide-react";
import { PlanFeature } from "@/data/plans";

interface FeaturesListProps {
  features: PlanFeature[];
}

export function FeaturesList({ features }: FeaturesListProps) {
  return (
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li
          key={index}
          className="flex items-start gap-3 animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {feature.included ? (
            <Check className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
          ) : (
            <X className="h-5 w-5 shrink-0 text-muted-foreground/50 mt-0.5" />
          )}
          <span
            className={`text-sm ${
              feature.included ? "text-foreground" : "text-muted-foreground/70"
            }`}
          >
            {feature.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
