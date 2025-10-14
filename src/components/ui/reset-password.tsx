import React, { useState } from "react";

// --- TYPE DEFINITIONS ---

export interface ResetPasswordPageProps {
  logo?: string;
  title?: string;
  description?: string;
  heroImage?: string;
  onResetPassword?: (email: string) => void;
  onBackToLogin?: () => void;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-yellow-400/70 focus-within:bg-yellow-500/10">
    {children}
  </div>
);

// --- MAIN COMPONENT ---

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  logo,
  title = "Redefinir Senha",
  description = "Enviaremos um link de redefinição para seu email",
  heroImage,
  onResetPassword,
  onBackToLogin
}) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResetPassword?.(email);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Column - Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {logo && (
            <div className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0">
              <img src={logo} alt="Logo" className="h-12 w-auto" />
            </div>
          )}

          <div className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:100ms] space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:200ms]">
              <label className="block text-sm font-medium text-foreground/90 mb-2">Email</label>
              <GlassInputWrapper>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-transparent px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none"
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
      </div>

      {/* Right Column - Hero Image */}
      {heroImage && (
        <div className="hidden lg:block relative overflow-hidden bg-muted">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5"></div>
          <img
            src={heroImage}
            alt="Hero"
            className="h-full w-full object-cover opacity-80"
          />
        </div>
      )}
    </div>
  );
};
