import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ShortcutCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  onClick?: () => void;
  href?: string;
}

export const ShortcutCard = ({
  title,
  description,
  icon: Icon,
  iconColor = "text-primary",
  onClick,
  href,
}: ShortcutCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.02]",
        "bg-card/50 backdrop-blur-sm border-border/40"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
        <div className={cn(
          "p-3 rounded-full",
          "bg-yellow-500/20"
        )}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
