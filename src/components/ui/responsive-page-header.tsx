import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsivePageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function ResponsivePageHeader({
  title,
  description,
  action,
  className,
}: ResponsivePageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-8 animate-fade-in", className)}>
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1">
          {title}
        </h1>
        {description && (
          <p className="text-sm md:text-base text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="w-full md:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}
