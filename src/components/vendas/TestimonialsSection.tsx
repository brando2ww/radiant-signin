import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carla Mendes",
    role: "Designer Freelancer",
    location: "São Paulo, SP",
    avatar: "CM",
    rating: 5,
    text: "Antes eu vivia perdida com minhas finanças. Esquecia de pagar o DAS, não sabia quanto tinha faturado... Agora é só mandar uma mensagem e pronto! A Velara virou minha melhor amiga nos negócios.",
    highlight: "Nunca mais esqueci de pagar o DAS",
  },
  {
    name: "Roberto Silva",
    role: "Eletricista",
    location: "Belo Horizonte, MG",
    avatar: "RS",
    rating: 5,
    text: "Sou da velha guarda, não sou muito de tecnologia. Mas se é no WhatsApp, eu sei usar! A Velara me ajuda a controlar tudo sem precisar de aplicativo complicado. Minha esposa até perguntou quem era essa 'Velara' que eu ficava conversando!",
    highlight: "Simples como mandar mensagem",
  },
  {
    name: "Ana Paula Costa",
    role: "Confeiteira",
    location: "Curitiba, PR",
    avatar: "AC",
    rating: 5,
    text: "Comecei a usar no teste grátis e não quis parar mais. Me ajudou demais a entender quanto eu realmente ganhava e gastava. Descobri que estava precificando meus bolos errado! Hoje meu lucro aumentou 30%.",
    highlight: "Lucro aumentou 30%",
  },
];

export const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Histórias de quem já usa
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            MEIs reais contando como a Velara mudou a forma deles cuidarem do dinheiro
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
            >
              <Card className="h-full hover:shadow-lg transition-shadow relative">
                <CardContent className="p-6">
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                  
                  {/* Highlight badge */}
                  <div className="mb-4">
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {testimonial.highlight}
                    </span>
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role} · {testimonial.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
