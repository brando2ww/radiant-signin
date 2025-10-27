import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useNotesByLead, useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/use-crm-notes";
import { NoteCard } from "./NoteCard";

interface LeadNotesTabProps {
  leadId: string;
}

export function LeadNotesTab({ leadId }: LeadNotesTabProps) {
  const [newNoteContent, setNewNoteContent] = useState('');

  const { data: notes = [], isLoading } = useNotesByLead(leadId);
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  const handleCreateNote = () => {
    if (!newNoteContent.trim()) return;

    createMutation.mutate({
      lead_id: leadId,
      content: newNoteContent,
      is_pinned: false,
    });

    setNewNoteContent('');
  };

  const handleUpdateNote = (id: string, content: string, isPinned: boolean) => {
    updateMutation.mutate({ id, content, is_pinned: isPinned });
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Deseja realmente excluir esta nota?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Carregando notas...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Editor de Nova Nota */}
      <Card className="p-4">
        <div className="space-y-3">
          <Textarea
            placeholder="Escreva uma nova nota..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="min-h-[120px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleCreateNote}
              disabled={!newNoteContent.trim() || createMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Nota
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de Notas */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            Nenhuma nota registrada
          </Card>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
            />
          ))
        )}
      </div>
    </div>
  );
}
