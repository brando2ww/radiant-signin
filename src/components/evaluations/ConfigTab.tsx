import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, Printer, Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useEvaluationQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion, useInitializeDefaultQuestions } from "@/hooks/use-evaluation-questions";
import { useSettings } from "@/hooks/use-settings";
import { useState, useEffect } from "react";
import { StarRating } from "./StarRating";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ConfigTab = () => {
  const { user } = useAuth();
  const { data: questions, isLoading } = useEvaluationQuestions();
  const { settings } = useSettings();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const initializeQuestions = useInitializeDefaultQuestions();
  
  const [newQuestion, setNewQuestion] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [npsEnabled, setNpsEnabled] = useState(true);

  const publicUrl = `${window.location.origin}/avaliar/${user?.id}`;

  // Note: NPS é sempre habilitado por padrão
  // Para desabilitar, será necessário adicionar suporte ao hook useSettings

  useEffect(() => {
    if (questions && questions.length === 0 && !isLoading) {
      initializeQuestions.mutate();
    }
  }, [questions, isLoading]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copiado!");
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = "qrcode-avaliacao.png";
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success("QR Code baixado!");
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handlePrint = () => {
    window.print();
    toast.success("Preparando impressão...");
  };

  const handleCreateQuestion = () => {
    if (newQuestion.length < 10) {
      toast.error("A pergunta deve ter no mínimo 10 caracteres");
      return;
    }
    createQuestion.mutate(newQuestion);
    setNewQuestion("");
  };

  const handleUpdateQuestion = (id: string) => {
    if (editingText.length < 10) {
      toast.error("A pergunta deve ter no mínimo 10 caracteres");
      return;
    }
    updateQuestion.mutate({ id, question_text: editingText });
    setEditingId(null);
    setEditingText("");
  };

  const handleToggleNps = async (checked: boolean) => {
    setNpsEnabled(checked);
    // Aqui atualizaria via hook de settings
    toast.success(checked ? "NPS ativado" : "NPS desativado");
  };

  return (
    <div className="space-y-6">
      {/* QR Code e Link */}
      <Card>
        <CardHeader>
          <CardTitle>Compartilhe sua Avaliação</CardTitle>
          <CardDescription>
            Use o QR Code ou link abaixo para que seus clientes possam avaliar seu estabelecimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4 p-6 bg-muted rounded-lg">
            <QRCodeSVG 
              id="qr-code"
              value={publicUrl} 
              size={200}
              level="H"
              includeMargin
            />
            <div className="flex gap-2">
              <Button onClick={handleDownloadQR} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Baixar QR Code
              </Button>
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Input value={publicUrl} readOnly />
            <Button onClick={handleCopyLink} variant="outline">
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            💡 Cole este QR Code no seu estabelecimento para que os clientes possam avaliar facilmente
          </p>
        </CardContent>
      </Card>

      {/* Perguntas de Satisfação */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas de Satisfação (1-5 estrelas)</CardTitle>
          <CardDescription>
            Configure as perguntas que seus clientes responderão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de perguntas */}
          <div className="space-y-2">
            {questions?.map((question) => (
              <div
                key={question.id}
                className="flex items-center gap-2 p-4 border rounded-lg bg-card"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                
                {editingId === question.id ? (
                  <Input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                ) : (
                  <p className="flex-1">{question.question_text}</p>
                )}

                <div className="flex items-center gap-2">
                  {editingId === question.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateQuestion(question.id)}
                      >
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setEditingText("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(question.id);
                          setEditingText(question.question_text);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteId(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Preview de estrelas */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-4 text-center">Preview:</p>
            <StarRating value={0} onChange={() => {}} readonly />
          </div>

          {/* Nova pergunta */}
          <div className="flex gap-2">
            <Input
              placeholder="Digite sua nova pergunta (mínimo 10 caracteres)"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <Button onClick={handleCreateQuestion} disabled={createQuestion.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pergunta NPS */}
      <Card>
        <CardHeader>
          <CardTitle>Pergunta NPS</CardTitle>
          <CardDescription>
            Pergunta de satisfação geral (0 a 10)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="nps-toggle">Ativar pergunta NPS</Label>
              <p className="text-sm text-muted-foreground">
                Pergunta fixa que aparece no final da avaliação
              </p>
            </div>
            <Switch
              id="nps-toggle"
              checked={npsEnabled}
              onCheckedChange={handleToggleNps}
            />
          </div>

          {npsEnabled && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="font-medium text-center mb-4">
                De 0 a 10, qual a chance de você recomendar este lugar para um amigo?
              </p>
              <div className="grid grid-cols-11 gap-1">
                {Array.from({ length: 11 }, (_, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="aspect-square p-0"
                  >
                    {i}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Nunca recomendaria</span>
                <span>Com certeza</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Dialog para confirmar exclusão */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Pergunta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteQuestion.mutate(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
