import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pin, Edit, Trash, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Note } from "@/hooks/use-crm-notes";

interface NoteCardProps {
  note: Note;
  onUpdate: (id: string, content: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onUpdate, onDelete }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    onUpdate(note.id, editContent, note.is_pinned);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleTogglePin = () => {
    onUpdate(note.id, note.content, !note.is_pinned);
  };

  return (
    <Card className={`p-4 ${note.is_pinned ? 'border-primary' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-xs text-muted-foreground">
          {format(new Date(note.created_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleTogglePin}
          >
            <Pin className={`h-3 w-3 ${note.is_pinned ? 'fill-primary text-primary' : ''}`} />
          </Button>
          {!isEditing && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(note.id)}
              >
                <Trash className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[100px]"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
      )}
    </Card>
  );
}
