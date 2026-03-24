import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PDVChartOfAccount {
  id: string;
  user_id: string;
  code: string;
  name: string;
  account_type: string;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePDVChartOfAccounts(accountType?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["pdv-chart-of-accounts", user?.id, accountType];

  const { data: accounts, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      let query = supabase
        .from("pdv_chart_of_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (accountType) {
        query = query.eq("account_type", accountType);
      }

      const { data, error } = await query.order("code");
      if (error) throw error;
      return data as PDVChartOfAccount[];
    },
    enabled: !!user,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["pdv-chart-of-accounts"] });
  };

  const createAccount = useMutation({
    mutationFn: async (account: { code: string; name: string; account_type: string; parent_id?: string | null }) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase
        .from("pdv_chart_of_accounts")
        .insert({ ...account, user_id: user.id, parent_id: account.parent_id || null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { invalidate(); toast.success("Conta criada com sucesso"); },
    onError: (e: any) => toast.error(e.message || "Erro ao criar conta"),
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; code?: string; name?: string; account_type?: string; parent_id?: string | null }) => {
      const { data, error } = await supabase
        .from("pdv_chart_of_accounts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { invalidate(); toast.success("Conta atualizada"); },
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar conta"),
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pdv_chart_of_accounts")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Conta removida"); },
    onError: (e: any) => toast.error(e.message || "Erro ao remover conta"),
  });

  const seedBasicStructure = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const parents = [
        { code: "1.000", name: "ENCARGOS SOCIAIS", account_type: "expense" },
        { code: "2.000", name: "BENEFÍCIOS", account_type: "expense" },
        { code: "3.000", name: "MÃO-DE-OBRA", account_type: "expense" },
        { code: "4.000", name: "MATERIAIS", account_type: "expense" },
        { code: "5.000", name: "TERCEIROS", account_type: "expense" },
        { code: "6.000", name: "UTILIDADES E COMUNIC", account_type: "expense" },
        { code: "7.000", name: "PUBLICIDADE E PROPAG", account_type: "expense" },
        { code: "9.000", name: "IMPOSTOS", account_type: "expense" },
        { code: "10.000", name: "DESPESAS PREDIAIS", account_type: "expense" },
        { code: "11.000", name: "DESPESAS FINANCEIRAS", account_type: "expense" },
        { code: "12.000", name: "DESPESAS GERAIS", account_type: "expense" },
        { code: "13.000", name: "DESPESA SISTEMA", account_type: "expense" },
        { code: "20.000", name: "ENTRADA DE PRODUTOS", account_type: "cost" },
        { code: "30.000", name: "RECEITAS", account_type: "revenue" },
        { code: "40.000", name: "Outros Débitos", account_type: "expense" },
      ];

      const { data: insertedParents, error: e1 } = await supabase
        .from("pdv_chart_of_accounts")
        .insert(parents.map(p => ({ ...p, user_id: user.id })))
        .select("id, code");
      if (e1) throw e1;

      const parentMap: Record<string, string> = {};
      (insertedParents || []).forEach((p: any) => { parentMap[p.code] = p.id; });

      const children = [
        { parent: "1.000", code: "1.001", name: "Férias" },
        { parent: "1.000", code: "1.002", name: "INSS" },
        { parent: "1.000", code: "1.003", name: "FGTS" },
        { parent: "1.000", code: "1.004", name: "Indenizações trab." },
        { parent: "1.000", code: "1.005", name: "Rescisões" },
        { parent: "1.000", code: "1.006", name: "Abonos de rescisões" },
        { parent: "1.000", code: "1.007", name: "Contrib Sindical" },
        { parent: "1.000", code: "1.008", name: "PCMSO/PPRA" },
        { parent: "1.000", code: "1.009", name: "Encargos Terceiros" },
        { parent: "1.000", code: "1.010", name: "13º Salário" },
        { parent: "2.000", code: "2.001", name: "Vale-transporte" },
        { parent: "2.000", code: "2.002", name: "Alimentação" },
        { parent: "2.000", code: "2.003", name: "Plano de Saúde" },
        { parent: "2.000", code: "2.004", name: "Farmácia" },
        { parent: "3.000", code: "3.001", name: "Salários" },
        { parent: "3.000", code: "3.002", name: "Comissões" },
        { parent: "3.000", code: "3.003", name: "Particip./Gratific." },
        { parent: "3.000", code: "3.004", name: "Vale" },
        { parent: "3.000", code: "3.005", name: "Pró-Labore" },
        { parent: "3.000", code: "3.006", name: "Extras - Diária" },
        { parent: "3.000", code: "3.007", name: "Salário Extra Cozinha" },
        { parent: "4.000", code: "4.001", name: "Material de expedien" },
        { parent: "4.000", code: "4.002", name: "Material limpeza" },
        { parent: "4.000", code: "4.003", name: "Uniformes" },
        { parent: "4.000", code: "4.004", name: "Material Escritório" },
        { parent: "4.000", code: "4.005", name: "Gás" },
        { parent: "4.000", code: "4.006", name: "Gelo" },
        { parent: "5.000", code: "5.001", name: "Lavanderia" },
        { parent: "5.000", code: "5.002", name: "Limpeza" },
        { parent: "5.000", code: "5.003", name: "Segurança" },
        { parent: "5.000", code: "5.004", name: "Motoboy" },
        { parent: "5.000", code: "5.005", name: "Paisagismo" },
        { parent: "5.000", code: "5.006", name: "Som e imagem" },
        { parent: "5.000", code: "5.007", name: "Serviços jurídicos" },
        { parent: "5.000", code: "5.008", name: "Consultorias" },
        { parent: "5.000", code: "5.009", name: "Contab./Adm. Pessoal" },
        { parent: "5.000", code: "5.010", name: "Informática" },
        { parent: "5.000", code: "5.011", name: "Desenv./Recrutam." },
        { parent: "5.000", code: "5.012", name: "Contratos Musicais" },
        { parent: "5.000", code: "5.013", name: "Asses. de Imprensa" },
        { parent: "5.000", code: "5.014", name: "Temporários" },
        { parent: "6.000", code: "6.001", name: "Energia elétrica" },
        { parent: "6.000", code: "6.002", name: "Gás GLP" },
        { parent: "6.000", code: "6.003", name: "CO2" },
        { parent: "6.000", code: "6.004", name: "Água" },
        { parent: "6.000", code: "6.005", name: "Combustível" },
        { parent: "6.000", code: "6.006", name: "Celular" },
        { parent: "6.000", code: "6.007", name: "Telefonia fixa" },
        { parent: "6.000", code: "6.008", name: "Internet" },
        { parent: "7.000", code: "7.003", name: "Publicidade e propag" },
        { parent: "7.000", code: "7.004", name: "Patrocínios" },
        { parent: "7.000", code: "7.005", name: "Eventos" },
        { parent: "7.000", code: "7.006", name: "Cortesias" },
        { parent: "9.000", code: "9.001", name: "ICMS" },
        { parent: "9.000", code: "9.002", name: "IPI" },
        { parent: "9.000", code: "9.003", name: "ISS" },
        { parent: "9.000", code: "9.004", name: "PIS" },
        { parent: "9.000", code: "9.005", name: "COFINS" },
        { parent: "9.000", code: "9.006", name: "IRPJ" },
        { parent: "9.000", code: "9.007", name: "Contribuição Social" },
        { parent: "9.000", code: "9.008", name: "ECAD" },
        { parent: "9.000", code: "9.009", name: "IRRF" },
        { parent: "9.000", code: "9.010", name: "Energia Elétrica" },
        { parent: "10.000", code: "10.001", name: "Aluguéis prediais" },
        { parent: "10.000", code: "10.002", name: "Condomínio" },
        { parent: "10.000", code: "10.003", name: "IPTU" },
        { parent: "11.000", code: "11.001", name: "Encargos financeiros" },
        { parent: "11.000", code: "11.002", name: "Tarifas bancárias" },
        { parent: "11.000", code: "11.003", name: "CPMF" },
        { parent: "11.000", code: "11.004", name: "IOF" },
        { parent: "11.000", code: "11.005", name: "Taxas de cartões" },
        { parent: "11.000", code: "11.006", name: "Desconto Débito" },
        { parent: "11.000", code: "11.007", name: "Empréstimo" },
        { parent: "12.000", code: "12.001", name: "Seguros" },
        { parent: "12.000", code: "12.002", name: "Manutenção" },
        { parent: "12.000", code: "12.003", name: "Transportes" },
        { parent: "12.000", code: "12.004", name: "Aluguéis diversos" },
        { parent: "12.000", code: "12.005", name: "Viagens/estadas" },
        { parent: "12.000", code: "12.006", name: "Associações e assina" },
        { parent: "12.000", code: "12.007", name: "Água" },
        { parent: "12.000", code: "12.013", name: "Taxas/Ifood" },
        { parent: "12.000", code: "12.017", name: "Despesas Diversas" },
        { parent: "13.000", code: "13.001", name: "Sistema" },
        { parent: "30.000", code: "30.001", name: "Dinheiro" },
        { parent: "30.000", code: "30.002", name: "Cheque" },
        { parent: "30.000", code: "30.003", name: "Visa" },
        { parent: "30.000", code: "30.004", name: "Visa Electron" },
        { parent: "30.000", code: "30.005", name: "Master" },
        { parent: "30.000", code: "30.006", name: "Redeshop" },
        { parent: "30.000", code: "30.007", name: "Hipercard" },
        { parent: "30.000", code: "30.008", name: "Amex" },
        { parent: "30.000", code: "30.009", name: "Tickets" },
        { parent: "30.000", code: "30.010", name: "Visa Vale" },
        { parent: "30.000", code: "30.011", name: "Banricompras" },
        { parent: "30.000", code: "30.020", name: "Outros Créditos" },
        { parent: "30.000", code: "30.021", name: "Rend financeiros" },
        { parent: "30.000", code: "30.022", name: "Pagamento Ifood" },
        { parent: "30.000", code: "30.023", name: "Pix" },
        { parent: "30.000", code: "30.032", name: "Eventos Externos" },
        { parent: "30.000", code: "30.033", name: "Patrocínios" },
        { parent: "30.000", code: "30.040", name: "Fundo Deb" },
        { parent: "30.000", code: "30.042", name: "Repique" },
        { parent: "30.000", code: "30.043", name: "Sobra" },
        { parent: "30.000", code: "30.044", name: "Falta" },
        { parent: "30.000", code: "30.201", name: "Juro Credito" },
        { parent: "30.000", code: "30.202", name: "Desconto Credito" },
        { parent: "40.000", code: "40.001", name: "Deduções de Vendas" },
        { parent: "40.000", code: "40.002", name: "Cheques Devolvidos" },
        { parent: "40.000", code: "40.003", name: "Variação Cambial" },
        { parent: "40.000", code: "40.004", name: "Compras Estruturais" },
      ];

      const parentTypeMap: Record<string, string> = {};
      parents.forEach(p => { parentTypeMap[p.code] = p.account_type; });

      const childRows = children.map(c => ({
        code: c.code,
        name: c.name,
        account_type: parentTypeMap[c.parent],
        parent_id: parentMap[c.parent] || null,
        user_id: user.id,
      }));

      const { error: e2 } = await supabase
        .from("pdv_chart_of_accounts")
        .insert(childRows);
      if (e2) throw e2;
    },
    onSuccess: () => { invalidate(); toast.success("Estrutura básica criada com sucesso"); },
    onError: (e: any) => toast.error(e.message || "Erro ao criar estrutura básica"),
  });

  return {
    accounts: accounts || [],
    isLoading,
    createAccount,
    updateAccount,
    deleteAccount,
    seedBasicStructure,
  };
}
