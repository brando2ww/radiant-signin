import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "O que é o agente de IA?",
    answer: "É um assistente virtual inteligente que funciona pelo WhatsApp e entende suas perguntas sobre finanças em linguagem natural. Ele analisa seus dados, gera relatórios e te avisa sobre vencimentos e oportunidades.",
  },
  {
    question: "Como funciona pelo WhatsApp?",
    answer: "Você adiciona nosso número oficial e conversa naturalmente, como se estivesse falando com seu contador. Pode fazer perguntas, pedir relatórios ou registrar transações usando texto ou áudio.",
  },
  {
    question: "Meus dados estão seguros?",
    answer: "Sim! Usamos criptografia de ponta a ponta, conformidade total com LGPD, e seus dados financeiros nunca são compartilhados. Temos as mesmas certificações de segurança dos maiores bancos.",
  },
  {
    question: "Quando será o lançamento?",
    answer: "Estamos em fase final de testes e planejamos lançar em breve. Quem entrar na fila agora será avisado com prioridade e terá acesso antecipado.",
  },
  {
    question: "Qual o preço após o período promocional?",
    answer: "Após os primeiros 100 assinantes, o preço será R$ 197/mês. Mas quem entrar agora garante R$ 97/mês para sempre (preço congelado).",
  },
  {
    question: "Posso testar antes de pagar?",
    answer: "Sim! Oferecemos 7 dias de teste grátis e 30 dias de garantia incondicional. Se não gostar, devolvemos 100% do seu dinheiro.",
  },
  {
    question: "Funciona para qualquer tipo de negócio?",
    answer: "Sim! Atende desde MEIs e freelancers até pequenas e médias empresas de qualquer segmento. O agente se adapta ao seu modelo de negócio.",
  },
  {
    question: "Preciso entender de tecnologia?",
    answer: "Não! Se você sabe usar WhatsApp, já sabe usar nossa plataforma. É simples e intuitivo como uma conversa normal.",
  },
];

export const FAQSection = () => {
  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-muted-foreground">
            Tudo o que você precisa saber
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
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
