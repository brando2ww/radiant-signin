import logo from "@/assets/logo_velara_preto.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-6",
  md: "h-8",
  lg: "h-10"
};

export function Logo({ variant = "full", size = "md", className }: LogoProps) {
  return (
    <img 
      src={logo} 
      alt="Velara" 
      className={cn(sizeClasses[size], className)} 
    />
  );
}
