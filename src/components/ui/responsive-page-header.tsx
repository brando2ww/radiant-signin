import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsivePageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string; // Alias for description
  action?: ReactNode;
  children?: ReactNode; // Alternative to action
  className?: string;
}

export function ResponsivePageHeader({
  title,
  description,
  subtitle,
  action,
  children,
  className,
}: ResponsivePageHeaderProps) {
  const desc = description || subtitle;
  const actionContent = action || children;

  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-8 animate-fade-in", className)}>
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1">
          {title}
        </h1>
        {desc && (
          <p className="text-sm md:text-base text-muted-foreground">
            {desc}
          </p>
        )}
      </div>
      {actionContent && (
        <div className="w-full md:w-auto">
          {actionContent}
        </div>
      )}
    </div>
  );
}
