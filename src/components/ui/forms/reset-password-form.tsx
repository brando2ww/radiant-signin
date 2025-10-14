import React, { useState } from "react";
import { GlassInputWrapper } from '@/components/ui/auth-layout';

interface ResetPasswordFormProps {
  onSubmit?: (email: string) => void;
  onBackToLogin?: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSubmit,
  onBackToLogin
}) => {
  const [email, setEmail] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(email);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 text-4xl md:text-5xl font-semibold leading-tight">
        <span className="font-light text-foreground tracking-tighter">Redefinir Senha</span>
      </h1>
      <p className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:100ms] text-muted-foreground">
        Enviaremos um link de redefinição para seu email
      </p>

      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:200ms]">
          <label className="text-sm font-medium text-muted-foreground">Email</label>
          <GlassInputWrapper>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
              required
            />
          </GlassInputWrapper>
        </div>

        <button type="submit" className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:300ms] w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Enviar Link de Redefinição
        </button>

        <p className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:400ms] text-center text-sm text-muted-foreground">
          Lembrou sua senha? <a href="#" onClick={(e) => { e.preventDefault(); onBackToLogin?.(); }} className="text-yellow-400 hover:underline transition-colors">Voltar para Login</a>
        </p>
      </form>
    </div>
  );
};