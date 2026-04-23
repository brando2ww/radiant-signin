import logo from "@/assets/logo_velara_preto.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8",
  md: "h-10",
  lg: "h-14",
  xl: "h-16"
};

export function Logo({ variant = "full", size = "md", className }: LogoProps) {
  return (
    <img 
      src={logo} 
      alt="Velara" 
      className={cn(sizeClasses[size], "dark:invert", className)} 
    />
  );
}
