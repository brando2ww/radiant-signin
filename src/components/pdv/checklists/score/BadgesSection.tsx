import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BadgeDefinition } from "@/hooks/use-operator-scores";

interface BadgesSectionProps {
  badges: BadgeDefinition[];
}

export function BadgesSection({ badges }: BadgesSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Badges e Conquistas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map(badge => (
            <div key={badge.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
              <span className="text-2xl">{badge.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{badge.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                <div className="mt-2">
                  {badge.earnedCount > 0 ? (
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-1.5">
                        {badge.earnedBy.slice(0, 3).map((name, i) => (
                          <Avatar key={i} className="h-5 w-5 border border-background">
                            <AvatarFallback className="text-[8px]">
                              {name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-[11px] text-muted-foreground ml-1">
                        {badge.earnedCount} {badge.earnedCount === 1 ? "conquistou" : "conquistaram"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Ninguém conquistou ainda</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
