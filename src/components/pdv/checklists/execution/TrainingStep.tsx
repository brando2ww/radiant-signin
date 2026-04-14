import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Play } from "lucide-react";

interface TrainingStepProps {
  instruction?: string | null;
  videoUrl?: string | null;
  onAcknowledge: () => void;
  acknowledged: boolean;
}

export function TrainingStep({ instruction, videoUrl, onAcknowledge, acknowledged }: TrainingStepProps) {
  if (!instruction && !videoUrl) return null;

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
          <BookOpen className="h-4 w-4" />
          Instrução de Treinamento
        </div>

        {instruction && (
          <p className="text-sm text-muted-foreground">{instruction}</p>
        )}

        {videoUrl && (
          <div className="aspect-video rounded-md overflow-hidden bg-black">
            <iframe
              src={videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Checkbox
            id="training-ack"
            checked={acknowledged}
            onCheckedChange={(v) => v && onAcknowledge()}
            disabled={acknowledged}
          />
          <label htmlFor="training-ack" className="text-sm cursor-pointer">
            Li e entendi a instrução
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
