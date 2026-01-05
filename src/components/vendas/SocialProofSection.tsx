import { motion } from "framer-motion";
import { Shield, Lock, Headphones } from "lucide-react";

const stats = [
  { value: "500+", label: "MEIs ativos" },
  { value: "R$ 10M+", label: "Gerenciados" },
  { value: "50.000+", label: "Transações" },
  { value: "4.9/5", label: "Avaliação" },
];

const badges = [
  { icon: Shield, label: "LGPD Compliant" },
  { icon: Lock, label: "Criptografia" },
  { icon: Headphones, label: "Suporte" },
];

export const SocialProofSection = () => {
  return (
    <section className="py-12 border-b border-border/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-8"
        >
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {badges.map((badge, index) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <badge.icon className="w-4 h-4" />
                <span className="text-sm">{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
