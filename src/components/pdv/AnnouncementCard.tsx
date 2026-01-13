import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  date: string;
}

export function AnnouncementCard() {
  const [dismissed, setDismissed] = useState<string[]>([]);

  // Comunicados estáticos por enquanto
  const announcements: Announcement[] = [
    {
      id: "1",
      title: "Bem-vindo ao Velara PDV!",
      message: "Configure suas mesas e produtos para começar a usar o sistema.",
      type: "info",
      date: "13/01/2026",
    },
  ];

  const visibleAnnouncements = announcements.filter(
    (a) => !dismissed.includes(a.id)
  );

  if (visibleAnnouncements.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Megaphone className="h-5 w-5 text-primary" />
          Comunicados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            className="flex items-start justify-between gap-4 rounded-lg bg-background p-3"
          >
            <div className="flex-1">
              <p className="font-medium">{announcement.title}</p>
              <p className="text-sm text-muted-foreground">
                {announcement.message}
              </p>
              <span className="text-xs text-muted-foreground">
                {announcement.date}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setDismissed((prev) => [...prev, announcement.id])}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
