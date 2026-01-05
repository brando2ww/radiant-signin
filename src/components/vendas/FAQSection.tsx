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
    answer:
      "É simples: você se cadastra e tem acesso completo a todas as funcionalidades por 20 dias, sem pagar nada. Pode usar à vontade, testar tudo. Se gostar, continua. Se não gostar, cancela sem custo algum. Sem pegadinhas, prometemos!",
  },
  {
    question: "Preciso colocar cartão de crédito para testar?",
    answer:
      "Sim, pedimos o cartão no cadastro para facilitar a continuidade caso você goste. Mas fique tranquilo: você só será cobrado após os 20 dias, e pode cancelar a qualquer momento antes disso. A gente te avisa antes de cobrar.",
  },
  {
    question: "Qual a diferença entre o plano mensal e anual?",
    answer:
      "O plano anual sai 20% mais barato (é como ganhar 2 meses grátis!) e você ainda tem suporte prioritário. O mensal é ótimo se você quer mais flexibilidade e prefere ir mês a mês. Nos dois casos, você tem acesso a todas as funcionalidades.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Claro! Sem multa, sem burocracia, sem perguntas chatas. É só cancelar pelo próprio app ou nos chamar no WhatsApp. Se for no plano anual, você continua usando até o fim do período que já pagou.",
  },
  {
    question: "Como a Velara me ajuda com meu MEI?",
    answer:
      "A Velara foi feita pensando em você, MEI! Ela controla seu faturamento, te avisa quando o DAS vai vencer, mostra quanto falta pro limite de R$ 81.000 e te manda relatórios automáticos. É como ter um contador de bolso, só que muito mais simpático.",
  },
  {
    question: "E se eu estiver chegando perto do limite do MEI?",
    answer:
      "A gente te avisa com antecedência! Quando você atingir 80% do limite, você recebe um alerta. Assim você tem tempo de se planejar caso precise mudar de regime. Melhor saber antes do que levar um susto, né?",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Muito seguros! Usamos criptografia de ponta a ponta, os mesmos padrões de segurança dos bancos. Somos 100% conformes com a LGPD e seus dados nunca são compartilhados com terceiros. Sua privacidade é sagrada pra gente.",
  },
  {
    question: "Funciona para qualquer tipo de MEI?",
    answer:
      "Sim! Não importa se você é cabeleireiro, eletricista, confeiteira, designer, motorista de app ou qualquer outra atividade. Se você é MEI e quer organizar suas finanças de um jeito fácil, a Velara é pra você.",
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="py-20">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Tudo que você precisa saber antes de começar
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
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
