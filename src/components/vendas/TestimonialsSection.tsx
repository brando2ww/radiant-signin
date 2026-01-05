import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Carla Mendes",
    role: "Designer Freelancer",
    avatar: "CM",
    rating: 5,
    text: "Finalmente consigo controlar meu MEI sem planilha. Só pergunto no WhatsApp e tenho todas as informações na hora.",
  },
  {
    name: "Ricardo Silva",
    role: "Eletricista",
    avatar: "RS",
    rating: 5,
    text: "O alerta de DAS me salvou de pagar multa. Agora nunca mais esqueço um vencimento.",
  },
  {
    name: "Ana Paula Costa",
    role: "Confeiteira",
    avatar: "AC",
    rating: 5,
    text: "Acompanho meu limite do MEI em tempo real. Quando cheguei perto dos R$ 81 mil, o agente me avisou com antecedência.",
  },
];

export const TestimonialsSection = () => {
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
            MEIs que transformaram suas finanças
          </h2>
          <p className="text-muted-foreground text-lg">
            Veja o que nossos clientes dizem
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-background rounded-xl p-6 border border-border/50"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground mb-6 text-sm leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-sm">{testimonial.name}</div>
                  <div className="text-muted-foreground text-xs">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
