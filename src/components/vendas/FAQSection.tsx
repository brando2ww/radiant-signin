import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona o teste de 20 dias?",
    answer: "Você tem acesso completo a todas as funcionalidades por 20 dias, sem compromisso. Após o período, seu plano é ativado automaticamente. Pode cancelar a qualquer momento antes sem custo.",
  },
  {
    question: "Preciso colocar cartão para testar?",
    answer: "Não! O teste de 20 dias é totalmente gratuito e não exige cartão. Você só adiciona o cartão se decidir continuar após o teste.",
  },
  {
    question: "Qual a diferença entre o plano mensal e anual?",
    answer: "O plano anual oferece 20% de desconto (equivale a 2 meses grátis). Você paga R$ 286,80 por ano em vez de R$ 358,80. Ambos têm acesso às mesmas funcionalidades.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Sem multas ou burocracia. Basta enviar uma mensagem solicitando o cancelamento. Você mantém acesso até o fim do período já pago.",
  },
  {
    question: "Como o agente me ajuda com o MEI?",
    answer: "O agente controla seu faturamento em tempo real, te avisa quando está chegando perto do limite de R$ 81.000, lembra de pagar o DAS e envia relatórios automáticos. Tudo pelo WhatsApp.",
  },
  {
    question: "E se eu ultrapassar o limite do MEI?",
    answer: "O agente te avisa com antecedência quando você está se aproximando do limite anual de R$ 81.000, para você se preparar para uma possível mudança de regime tributário.",
  },
  {
    question: "Meus dados estão seguros?",
    answer: "Sim! Utilizamos criptografia de ponta a ponta e seguimos todas as normas da LGPD. Seus dados financeiros são armazenados com segurança e nunca são compartilhados.",
  },
  {
    question: "Funciona para qualquer tipo de MEI?",
    answer: "Sim! Prestadores de serviço, comércio, produtores, freelancers, autônomos. Qualquer atividade enquadrada como MEI pode usar a Velara.",
  },
];

export const FAQSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Tire suas dúvidas sobre a Velara
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
