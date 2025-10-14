import React, { useState } from "react";

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-yellow-400/70 focus-within:bg-yellow-500/10">
    {children}
  </div>
);

interface ResetPasswordFormProps {
  onSubmit: (email: string) => void;
  onBackToLogin: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSubmit,
  onBackToLogin
}) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <>
      <p className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:100ms] text-muted-foreground">Enviaremos um link de redefinição para seu email</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:200ms]">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
          <GlassInputWrapper>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-transparent px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none rounded-2xl"
              required
            />
          </GlassInputWrapper>
        </div>

        <button type="submit" className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:300ms] w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Enviar Link de Redefinição
        </button>

        <p className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:400ms] text-center text-sm text-muted-foreground">
          Lembrou sua senha? <a href="#" onClick={(e) => { e.preventDefault(); onBackToLogin(); }} className="text-yellow-400 hover:underline transition-colors">Voltar para Login</a>
        </p>
      </form>
    </>
  );
};