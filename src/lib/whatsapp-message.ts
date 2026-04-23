import { formatBRL } from "@/lib/format";
// Utilitário para geração de links e mensagens WhatsApp

interface QuotationItem {
  ingredientName: string;
  quantity: number;
  unit: string;
}

interface OrderItem {
  ingredientName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface PurchaseOrder {
  orderNumber: string;
  total: number;
  expectedDelivery?: Date;
}

/**
 * Formata número de telefone para o padrão WhatsApp
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  // Adiciona código do Brasil se não tiver
  return cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
}

/**
 * Gera link do WhatsApp com mensagem
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const phoneWithCountry = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`;
}

/**
 * Gera mensagem de solicitação de cotação
 */
export function generateQuotationMessage(
  items: QuotationItem[],
  deadline: Date,
  businessName?: string,
  requestNumber?: string
): string {
  const formattedDeadline = deadline.toLocaleDateString('pt-BR');
  
  let message = `Olá! `;
  
  if (businessName) {
    message += `Aqui é do *${businessName}*.\n`;
  }
  
  if (requestNumber) {
    message += `📋 *Ref.: ${requestNumber}*\n\n`;
  } else {
    message += `\n`;
  }
  
  message += `Estamos solicitando cotação para os seguintes produtos:\n\n`;
  
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.ingredientName}: ${item.quantity} ${item.unit}\n`;
  });
  
  message += `\nPor favor, informe para cada item:\n`;
  message += `• Preço unitário\n`;
  message += `• Validade do produto\n`;
  message += `• Prazo de entrega\n`;
  message += `• Pedido mínimo (se houver)\n\n`;
  message += `Aguardamos retorno até ${formattedDeadline}.\n`;
  message += `Obrigado!`;
  
  return message;
}

/**
 * Gera mensagem de pedido de compra
 */
export function generateOrderMessage(
  order: PurchaseOrder,
  items: OrderItem[],
  businessName?: string
): string {
  let message = `Olá! `;
  
  if (businessName) {
    message += `Aqui é do ${businessName}. `;
  }
  
  message += `Gostaríamos de confirmar o seguinte pedido:\n\n`;
  message += `📋 *PEDIDO ${order.orderNumber}*\n\n`;
  
  items.forEach((item) => {
    const total = item.quantity * item.unitPrice;
    message += `• ${item.ingredientName}: ${item.quantity} ${item.unit} x ${formatBRL(item.unitPrice)} = ${formatBRL(total)}\n`;
  });
  
  message += `\n💰 *Total: ${formatBRL(order.total)}*\n`;
  
  if (order.expectedDelivery) {
    const formattedDelivery = order.expectedDelivery.toLocaleDateString('pt-BR');
    message += `📅 Entrega prevista: ${formattedDelivery}\n`;
  }
  
  message += `\nPor favor, confirme o recebimento deste pedido.\n`;
  message += `Obrigado!`;
  
  return message;
}

/**
 * Abre WhatsApp em nova aba
 */
export function openWhatsApp(phone: string, message: string): void {
  const link = generateWhatsAppLink(phone, message);
  window.open(link, '_blank');
}

/**
 * Formata valor em reais (padrão BR).
 * @deprecated Importe `formatBRL` (ou `formatCurrency`) de `@/lib/format`.
 */
export { formatBRL as formatCurrency } from "./format";

