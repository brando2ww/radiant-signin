export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  isPopular?: boolean;
  buttonText: string;
  icon: string;
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: "free",
    name: "Gratuito",
    description: "Perfeito para começar",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { text: "Até 50 transações/mês", included: true },
      { text: "1 cartão de crédito", included: true },
      { text: "Relatórios básicos", included: true },
      { text: "Agenda e tarefas", included: true },
      { text: "Suporte por email", included: true },
      { text: "Exportação de dados", included: false },
      { text: "Categorias customizadas", included: false },
      { text: "Integrações bancárias", included: false },
    ],
    buttonText: "Começar Grátis",
    icon: "Rocket",
  },
  pro: {
    id: "pro",
    name: "Profissional",
    description: "Para MEIs em crescimento",
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      { text: "Transações ilimitadas", included: true },
      { text: "Até 5 cartões de crédito", included: true },
      { text: "Relatórios avançados com gráficos", included: true },
      { text: "Exportação (CSV, Excel, PDF)", included: true },
      { text: "Categorias customizadas", included: true },
      { text: "Alertas inteligentes", included: true },
      { text: "Backup automático", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "Integrações bancárias", included: false },
    ],
    isPopular: true,
    buttonText: "Assinar Agora",
    icon: "Zap",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "Solução completa para seu negócio",
    monthlyPrice: 199,
    yearlyPrice: 159,
    features: [
      { text: "Tudo do Profissional", included: true },
      { text: "Cartões ilimitados", included: true },
      { text: "Integrações bancárias (Open Finance)", included: true },
      { text: "API de acesso", included: true },
      { text: "Multi-usuários (até 5)", included: true },
      { text: "Relatórios personalizados", included: true },
      { text: "Suporte 24/7 + WhatsApp", included: true },
      { text: "Consultor financeiro dedicado", included: true },
      { text: "White label (opcional)", included: true },
    ],
    buttonText: "Fale Conosco",
    icon: "Building",
  },
};

export const FAQ_ITEMS = [
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim! Você pode cancelar sua assinatura a qualquer momento sem custos adicionais. Ao cancelar, você terá acesso aos recursos do plano até o final do período já pago.",
  },
  {
    question: "Qual a diferença entre pagamento mensal e anual?",
    answer: "O pagamento anual oferece 20% de desconto em relação ao mensal. Por exemplo, o plano Profissional custa R$ 49/mês (R$ 588/ano) no pagamento mensal, mas apenas R$ 39/mês (R$ 468/ano) no pagamento anual.",
  },
  {
    question: "Posso fazer upgrade ou downgrade do meu plano?",
    answer: "Sim! Você pode alterar seu plano a qualquer momento. No upgrade, você paga apenas a diferença proporcional. No downgrade, o crédito é aplicado nos próximos meses.",
  },
  {
    question: "Como funciona o período de teste?",
    answer: "Todos os planos pagos oferecem 7 dias de teste gratuito. Você pode experimentar todos os recursos sem precisar informar cartão de crédito.",
  },
  {
    question: "Meus dados estão seguros?",
    answer: "Sim! Utilizamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança da indústria. Seus dados financeiros são armazenados de forma segura e nunca são compartilhados com terceiros.",
  },
  {
    question: "Quais métodos de pagamento são aceitos?",
    answer: "Aceitamos cartões de crédito (Visa, Mastercard, American Express), PIX e boleto bancário. Para pagamentos anuais, oferecemos desconto adicional via PIX.",
  },
];
