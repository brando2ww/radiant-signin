import { AlertTriangle, Clock, FileQuestion, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const problems = [
  {
    icon: TrendingDown,
    title: "Perda de Controle",
    description: "Não sabe exatamente quanto dinheiro tem disponível e descobre problemas quando já é tarde demais.",
  },
  {
    icon: Clock,
    title: "Tempo Perdido",
    description: "Horas gastas organizando planilhas, conferindo extratos e tentando entender o que está acontecendo.",
  },
  {
    icon: FileQuestion,
    title: "Decisões no Escuro",
    description: "Difícil saber se pode fazer aquela compra, contratar alguém ou investir sem fazer contas manualmente.",
  },
  {
    icon: AlertTriangle,
    title: "Surpresas Desagradáveis",
    description: "Contas vencidas, multas e juros porque você simplesmente esqueceu ou não tinha visibilidade dos vencimentos.",
  },
];

export const ProblemSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Já passou por isso?
          </h2>
          <p className="text-xl text-muted-foreground">
            Você não está sozinho. Milhares de empreendedores perdem tempo e dinheiro todo dia com essas frustrações.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border rounded-xl p-8 hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                <problem.icon className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="text-xl font-bold mb-3">{problem.title}</h3>
              <p className="text-muted-foreground">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
