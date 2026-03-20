import { useParams, useNavigate } from "react-router-dom";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, ExternalLink, ShoppingBag, RefreshCw, Clock, CheckCircle2,
  CreditCard, Smartphone, Wifi, Split, Receipt, TrendingUp, FileText,
  Send, XCircle, Mail, Upload, Shield, TabletSmartphone, QrCode,
  Palette, BarChart3, Menu, Zap, Settings2, MessageCircle, type LucideIcon,
} from "lucide-react";

import { IFoodIntegrationCard } from "@/components/pdv/integrations/IFoodIntegrationCard";
import { PagSeguroIntegrationCard } from "@/components/pdv/integrations/PagSeguroIntegrationCard";
import { StoneIntegrationCard } from "@/components/pdv/integrations/StoneIntegrationCard";
import { NFAutomaticaIntegrationCard } from "@/components/pdv/integrations/NFAutomaticaIntegrationCard";
import { GoomerIntegrationCard } from "@/components/pdv/integrations/GoomerIntegrationCard";
import { GetnetIntegrationCard } from "@/components/pdv/integrations/GetnetIntegrationCard";
import { WhatsAppConnectionCard } from "@/components/pdv/settings/WhatsAppConnectionCard";

import ifoodLogo from "@/assets/integrations/ifood.png";
import pagseguroLogo from "@/assets/integrations/pagseguro.png";
import stoneLogo from "@/assets/integrations/stone.png";
import goomerLogo from "@/assets/integrations/goomer.png";
import nfeLogo from "@/assets/integrations/nfe.png";
import getnetLogo from "@/assets/integrations/getnet.png";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface IntegrationData {
  title: string;
  logo?: string;
  fallbackIcon?: LucideIcon;
  category: string;
  description: string;
  features: Feature[];
  steps: string[];
  component: React.ComponentType;
  docsUrl: string;
  docsLabel: string;
}

const integrations: Record<string, IntegrationData> = {
  ifood: {
    title: "iFood",
    logo: ifoodLogo,
    category: "Delivery",
    description:
      "O iFood é a maior plataforma de delivery do Brasil, com mais de 80 milhões de pedidos por mês. Com esta integração, seu PDV recebe pedidos automaticamente, sincroniza o cardápio em tempo real e atualiza o status de cada pedido sem precisar acessar o portal do iFood. Reduza erros manuais, acelere o preparo e centralize toda a operação em um único sistema.",
    features: [
      { icon: ShoppingBag, title: "Recebimento de pedidos", description: "Pedidos do iFood chegam automaticamente no PDV em tempo real, sem necessidade de tablet separado." },
      { icon: RefreshCw, title: "Sincronização de cardápio", description: "Alterações de preço, disponibilidade e descrição são enviadas automaticamente para o iFood." },
      { icon: CheckCircle2, title: "Aceite automático", description: "Configure para aceitar pedidos automaticamente ou revise cada um antes de confirmar." },
      { icon: Clock, title: "Gestão de horários", description: "Defina horários de funcionamento e pausas diretamente pelo PDV." },
      { icon: Zap, title: "Atualização de status", description: "O status do pedido (em preparo, saiu para entrega, entregue) é atualizado automaticamente." },
      { icon: BarChart3, title: "Relatórios de vendas", description: "Acompanhe faturamento, ticket médio e volume de pedidos do iFood no painel de relatórios." },
    ],
    steps: [
      "Acesse o Portal do Parceiro iFood (merchant.ifood.com.br) e faça login com sua conta de restaurante.",
      "No menu lateral, vá em Integrações → API e gere um novo Client ID e Client Secret.",
      "Copie as credenciais e cole nos campos de conexão abaixo.",
      "Clique em 'Conectar' e autorize o acesso. Seu PDV começará a receber pedidos automaticamente.",
    ],
    component: IFoodIntegrationCard,
    docsUrl: "https://developer.ifood.com.br",
    docsLabel: "Documentação da API iFood",
  },
  pagseguro: {
    title: "PagSeguro",
    logo: pagseguroLogo,
    category: "Maquininha",
    description:
      "A PagSeguro é uma das maiores adquirentes do Brasil, oferecendo soluções de pagamento por cartão de débito, crédito e voucher. Com esta integração, sua maquininha PagSeguro se comunica diretamente com o PDV: o valor do pedido é enviado automaticamente para o terminal, eliminando digitação manual e reduzindo erros. Acompanhe taxas, parcelamento e antecipação de recebíveis em um só lugar.",
    features: [
      { icon: CreditCard, title: "Débito e crédito", description: "Aceite pagamentos em débito e crédito de todas as bandeiras com taxa competitiva." },
      { icon: Split, title: "Parcelamento flexível", description: "Configure parcelamento de 2x a 12x com ou sem juros para o cliente." },
      { icon: Receipt, title: "Comprovante digital", description: "Envie comprovantes por SMS ou e-mail, economizando papel e agilizando o atendimento." },
      { icon: Wifi, title: "Conexão Bluetooth/USB", description: "Conecte a maquininha via Bluetooth ou USB ao computador do PDV." },
      { icon: Zap, title: "Captura automática", description: "O valor do pedido é enviado automaticamente para a maquininha ao finalizar a venda." },
      { icon: TrendingUp, title: "Antecipação de recebíveis", description: "Antecipe suas vendas parceladas e receba o valor integral em até 1 dia útil." },
    ],
    steps: [
      "Acesse sua conta PagSeguro em conta.pagseguro.uol.com.br.",
      "Vá em Minha Conta → Integrações → Gerar Token e copie o token gerado.",
      "Cole o token no campo de conexão abaixo e clique em 'Conectar'.",
      "Pareie sua maquininha via Bluetooth ou conecte via USB e ela estará pronta para uso.",
    ],
    component: PagSeguroIntegrationCard,
    docsUrl: "https://dev.pagbank.uol.com.br",
    docsLabel: "Documentação PagBank/PagSeguro",
  },
  stone: {
    title: "Stone",
    logo: stoneLogo,
    category: "Maquininha",
    description:
      "A Stone é referência em soluções de pagamento para o varejo brasileiro, com atendimento dedicado e taxas transparentes. Com esta integração, seu terminal Stone se conecta diretamente ao PDV: envie valores automaticamente, configure split de pagamento entre sócios e acompanhe suas taxas e recebíveis em tempo real. Ideal para operações que exigem confiabilidade e suporte ágil.",
    features: [
      { icon: Smartphone, title: "Terminal integrado", description: "O terminal Stone recebe o valor do pedido automaticamente, sem digitação manual." },
      { icon: Split, title: "Split de pagamento", description: "Divida o valor da venda entre diferentes contas bancárias automaticamente." },
      { icon: Shield, title: "Pré-autorização", description: "Realize pré-autorização em cartão de crédito e capture o valor posteriormente." },
      { icon: Receipt, title: "Comprovante automático", description: "Imprima ou envie comprovantes digitais automaticamente após cada transação." },
      { icon: BarChart3, title: "Dashboard financeiro", description: "Acompanhe vendas, taxas e recebíveis pelo painel financeiro integrado." },
      { icon: TrendingUp, title: "Antecipação Stone", description: "Antecipe recebíveis com taxas competitivas diretamente pela plataforma." },
    ],
    steps: [
      "Localize o Stone Code no adesivo da sua maquininha ou no Portal Stone (portal.stone.com.br).",
      "Informe o Stone Code no campo de conexão abaixo.",
      "Selecione o tipo de captura (automática ou pré-autorização) e configure as preferências.",
      "Clique em 'Conectar'. O terminal será pareado e estará pronto para receber pagamentos.",
    ],
    component: StoneIntegrationCard,
    docsUrl: "https://docs.stone.com.br",
    docsLabel: "Documentação Stone",
  },
  "nf-automatica": {
    title: "NF Automática",
    logo: nfeLogo,
    category: "Fiscal",
    description:
      "A emissão automática de NF-e (Nota Fiscal Eletrônica) e NFC-e (Nota Fiscal de Consumidor Eletrônica) garante conformidade fiscal sem esforço manual. Com esta integração, cada venda finalizada no PDV gera automaticamente o documento fiscal, envia para a SEFAZ e disponibiliza o DANFE para o cliente. Suporte a todos os regimes tributários: Simples Nacional, Lucro Presumido e Lucro Real.",
    features: [
      { icon: FileText, title: "NFC-e automática", description: "Emissão automática de NFC-e ao finalizar cada venda no PDV." },
      { icon: FileText, title: "NF-e completa", description: "Emissão de NF-e para vendas B2B com todos os campos fiscais necessários." },
      { icon: Send, title: "Envio à SEFAZ", description: "Transmissão automática para a Secretaria da Fazenda com retorno em tempo real." },
      { icon: XCircle, title: "Cancelamento e correção", description: "Cancele NF-e dentro do prazo ou emita cartas de correção diretamente pelo PDV." },
      { icon: Upload, title: "DANFE e XML", description: "Geração automática do DANFE para impressão e XML para armazenamento fiscal." },
      { icon: Mail, title: "Envio por e-mail", description: "Envie automaticamente o XML e DANFE por e-mail para o cliente." },
    ],
    steps: [
      "Obtenha seu certificado digital A1 (.pfx) junto à autoridade certificadora credenciada.",
      "Faça upload do certificado no campo abaixo e informe a senha.",
      "Configure os dados fiscais: CNPJ, Inscrição Estadual, regime tributário e série da NF.",
      "Ative a emissão automática. A partir de agora, cada venda gera a nota fiscal automaticamente.",
    ],
    component: NFAutomaticaIntegrationCard,
    docsUrl: "https://www.nfe.fazenda.gov.br",
    docsLabel: "Portal Nacional da NF-e",
  },
  goomer: {
    title: "Goomer",
    logo: goomerLogo,
    category: "Cardápio Digital",
    description:
      "A Goomer transforma a experiência do cliente com cardápio digital interativo acessível via QR Code. Com esta integração, seu cardápio do PDV é sincronizado automaticamente com a plataforma Goomer: os clientes escaneiam o QR Code na mesa, fazem o pedido pelo celular e ele aparece direto no PDV. Reduza o tempo de espera, elimine erros de anotação e ofereça uma experiência moderna ao seu cliente.",
    features: [
      { icon: Menu, title: "Cardápio digital", description: "Cardápio interativo com fotos, descrições e preços atualizados automaticamente." },
      { icon: QrCode, title: "QR Code por mesa", description: "Cada mesa recebe um QR Code único que direciona para o cardápio digital." },
      { icon: TabletSmartphone, title: "Pedidos via tablet", description: "Receba pedidos feitos nos tablets das mesas diretamente no PDV." },
      { icon: RefreshCw, title: "Sync automático", description: "Alterações no cardápio do PDV são refletidas automaticamente no Goomer." },
      { icon: Palette, title: "Personalização visual", description: "Customize cores, logo e layout do cardápio digital para sua marca." },
      { icon: BarChart3, title: "Relatórios", description: "Acompanhe os itens mais pedidos e o comportamento dos clientes." },
    ],
    steps: [
      "Acesse sua conta Goomer em app.goomer.com.br e vá em Configurações → Integrações.",
      "Copie o token de API gerado automaticamente.",
      "Cole o token no campo de conexão abaixo e clique em 'Conectar'.",
      "O cardápio será sincronizado e os QR Codes estarão prontos para impressão.",
    ],
    component: GoomerIntegrationCard,
    docsUrl: "https://www.goomer.com.br",
    docsLabel: "Site Goomer",
  },
  getnet: {
    title: "Getnet",
    logo: getnetLogo,
    category: "Maquininha",
    description:
      "A Getnet, do grupo Santander, é uma das maiores adquirentes do Brasil com soluções de POS Integrado que se comunicam diretamente com sistemas de automação comercial. Com esta integração, sua maquininha Getnet recebe o valor do pedido automaticamente via Cloud-to-Cloud, USB ou HTTP. Suporta débito, crédito, parcelamento, Pix, pré-autorização e cancelamento — tudo controlado pelo PDV.",
    features: [
      { icon: Smartphone, title: "POS Integrado", description: "Comunicação direta com o terminal via Cloud, USB/Serial ou HTTP (Wi-Fi/Ethernet)." },
      { icon: CreditCard, title: "Débito e crédito", description: "Aceite todas as bandeiras com taxas competitivas e parcelamento de até 12x." },
      { icon: QrCode, title: "Pix no terminal", description: "Receba pagamentos via Pix diretamente na maquininha Getnet." },
      { icon: Shield, title: "Pré-autorização", description: "Realize pré-autorização e capture ou cancele o valor posteriormente." },
      { icon: Split, title: "Split de pagamento", description: "Divida o valor da venda entre diferentes contas bancárias automaticamente." },
      { icon: BarChart3, title: "Dashboard financeiro", description: "Acompanhe vendas, taxas e recebíveis pelo portal Getnet integrado." },
    ],
    steps: [
      "Acesse o portal developers.getnet.com.br e crie uma conta ou faça login.",
      "Em Minha Conta → Credenciais, copie o Seller ID, Client ID e Client Secret.",
      "Cole as credenciais nos campos de conexão abaixo e selecione o ambiente (Sandbox ou Produção).",
      "Escolha o tipo de conexão do POS (Cloud, USB ou HTTP) e clique em 'Conectar'.",
    ],
    component: GetnetIntegrationCard,
    docsUrl: "https://developers.getnet.com.br",
    docsLabel: "Portal do Desenvolvedor Getnet",
  },
  whatsapp: {
    title: "WhatsApp Business",
    fallbackIcon: MessageCircle,
    category: "Comunicação",
    description:
      "O WhatsApp Business permite que seu estabelecimento se comunique diretamente com clientes, envie notificações de pedidos, confirme reservas e ofereça atendimento personalizado. Com esta integração, conecte sua conta WhatsApp ao PDV e centralize toda a comunicação em um só lugar.",
    features: [
      { icon: Send, title: "Notificações de pedidos", description: "Envie atualizações automáticas sobre o status dos pedidos para os clientes." },
      { icon: CheckCircle2, title: "Confirmação de reservas", description: "Confirme reservas de mesas automaticamente via WhatsApp." },
      { icon: Receipt, title: "Envio de comprovantes", description: "Envie comprovantes de pagamento e notas diretamente pelo WhatsApp." },
      { icon: Zap, title: "Respostas rápidas", description: "Configure mensagens automáticas para perguntas frequentes." },
      { icon: ShoppingBag, title: "Recebimento de pedidos", description: "Receba pedidos dos clientes diretamente pelo WhatsApp integrado ao PDV." },
      { icon: BarChart3, title: "Relatórios de atendimento", description: "Acompanhe métricas de atendimento e tempo de resposta." },
    ],
    steps: [
      "Clique em 'Conectar' abaixo para iniciar o processo de vinculação.",
      "Informe o nome e número do WhatsApp Business do seu estabelecimento.",
      "Escaneie o QR Code exibido na tela com o aplicativo WhatsApp do celular.",
      "Após a conexão, seu WhatsApp estará integrado ao PDV para envio de notificações.",
    ],
    component: WhatsAppConnectionCard,
    docsUrl: "https://business.whatsapp.com",
    docsLabel: "WhatsApp Business",
  },
};

export default function IntegrationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const data = slug ? integrations[slug] : null;

  if (!data) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Integração não encontrada.
        <Button variant="link" onClick={() => navigate("/pdv/integracoes")}>
          Voltar
        </Button>
      </div>
    );
  }

  const Component = data.component;
  const FallbackIcon = data.fallbackIcon;

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-4xl">
      {/* Back + Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => navigate("/pdv/integracoes")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Integrações
        </Button>

        <div className="flex items-center gap-4">
          {data.logo ? (
            <img src={data.logo} alt={data.title} className="h-12 w-12 object-contain rounded-lg" />
          ) : FallbackIcon ? (
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <FallbackIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          ) : null}
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              {data.title}
              <Badge variant="outline">{data.category}</Badge>
            </h1>
          </div>
        </div>
      </div>

      <Separator />

      {/* Sobre */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Sobre
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
      </section>

      {/* Funcionalidades */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Funcionalidades
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.features.map((feat) => {
            const Icon = feat.icon;
            return (
              <Card key={feat.title} className="border-border/60">
                <CardContent className="p-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground">{feat.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Como Conectar */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Como Conectar
        </h2>
        <ol className="space-y-3">
          {data.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-muted-foreground pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <Separator />

      {/* Configurações */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Configurações
        </h2>
        <Component />
      </section>

      {/* Docs link */}
      <a
        href={data.docsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <ExternalLink className="h-4 w-4" />
        {data.docsLabel}
      </a>
    </div>
  );
}
