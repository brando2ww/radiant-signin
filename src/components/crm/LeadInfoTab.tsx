import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { Lead } from "@/hooks/use-crm-leads";

interface LeadInfoTabProps {
  lead: Lead;
  onSave: (updates: Partial<Lead>) => void;
}

export function LeadInfoTab({ lead, onSave }: LeadInfoTabProps) {
  const [formData, setFormData] = useState({
    name: lead.name,
    email: lead.email || '',
    phone: lead.phone || '',
    company: lead.company || '',
    position: lead.position || '',
    project_title: lead.project_title,
    project_description: lead.project_description || '',
    estimated_value: lead.estimated_value?.toString() || '',
    stage: lead.stage,
    priority: lead.priority,
    source: lead.source || '',
    tags: lead.tags?.join(', ') || '',
    expected_close_date: lead.expected_close_date || '',
    win_probability: lead.win_probability?.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: Partial<Lead> = {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      position: formData.position || undefined,
      project_title: formData.project_title,
      project_description: formData.project_description || undefined,
      estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : undefined,
      stage: formData.stage as Lead['stage'],
      priority: formData.priority as Lead['priority'],
      source: formData.source || undefined,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      expected_close_date: formData.expected_close_date || undefined,
      win_probability: formData.win_probability ? parseInt(formData.win_probability) : undefined,
    };

    onSave(updates);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-end">
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>

      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>🏢 Empresa</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company">Nome da Empresa</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Cargo</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Projeto */}
      <Card>
        <CardHeader>
          <CardTitle>💼 Projeto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project_title">Título do Projeto *</Label>
            <Input
              id="project_title"
              value={formData.project_title}
              onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project_description">Descrição</Label>
            <Textarea
              id="project_description"
              value={formData.project_description}
              onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
              rows={4}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="estimated_value">Valor Estimado (R$)</Label>
              <Input
                id="estimated_value"
                type="number"
                step="0.01"
                value={formData.estimated_value}
                onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="win_probability">Probabilidade de Ganho (%)</Label>
              <Input
                id="win_probability"
                type="number"
                min="0"
                max="100"
                value={formData.win_probability}
                onChange={(e) => setFormData({ ...formData, win_probability: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="stage">Estágio</Label>
            <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value as Lead['stage'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incoming">Novos</SelectItem>
                <SelectItem value="first_contact">Primeiro Contato</SelectItem>
                <SelectItem value="discussion">Discussão</SelectItem>
                <SelectItem value="negotiation">Negociação</SelectItem>
                <SelectItem value="won">Ganho</SelectItem>
                <SelectItem value="lost">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as Lead['priority'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Origem</Label>
            <Input
              id="source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="Ex: Indicação, Site, LinkedIn"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Ex: VIP, Urgente, Follow-up"
            />
          </div>
        </CardContent>
      </Card>

      {/* Datas */}
      <Card>
        <CardHeader>
          <CardTitle>📅 Datas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-2">
            <Label htmlFor="expected_close_date">Data Prevista de Fechamento</Label>
            <Input
              id="expected_close_date"
              type="date"
              value={formData.expected_close_date}
              onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
