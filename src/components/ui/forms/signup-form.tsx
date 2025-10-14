import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { GlassInputWrapper } from '@/components/ui/auth-layout';

// Google icon component
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

interface SignUpFormProps {
  onSubmit?: (data: { documentType: 'cpf' | 'cnpj'; document: string; name: string; email: string; password: string }) => void;
  onGoogleSignUp?: () => void;
  onBackToLogin?: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSubmit,
  onGoogleSignUp,
  onBackToLogin
}) => {
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cpf');
  const [documentValue, setDocumentValue] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const applyMask = (value: string, type: 'cpf' | 'cnpj') => {
    const numbers = value.replace(/\D/g, '');
    
    if (type === 'cpf') {
      return numbers
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    } else {
      return numbers
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2');
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyMask(e.target.value, documentType);
    setDocumentValue(masked);
  };

  const handleDocumentTypeChange = (type: 'cpf' | 'cnpj') => {
    setDocumentType(type);
    setDocumentValue('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    onSubmit?.({ documentType, document: documentValue, name, email, password });
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 text-4xl md:text-5xl font-semibold leading-tight">
        <span className="font-light text-foreground tracking-tighter">Criar Conta</span>
      </h1>
      <p className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:100ms] text-muted-foreground">
        Junte-se a nós e comece sua jornada
      </p>

      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* Document Type Selector */}
        <div className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:200ms]">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Tipo de Cadastro</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleDocumentTypeChange('cpf')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                documentType === 'cpf'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-foreground/5 text-muted-foreground hover:bg-foreground/10'
              }`}
            >
              CPF
            </button>
            <button
              type="button"
              onClick={() => handleDocumentTypeChange('cnpj')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                documentType === 'cnpj'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-foreground/5 text-muted-foreground hover:bg-foreground/10'
              }`}
            >
              CNPJ
            </button>
          </div>
        </div>

        {/* Document Field */}
        <div className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:300ms]">
          <label className="text-sm font-medium text-muted-foreground">
            {documentType === 'cpf' ? 'CPF' : 'CNPJ'}
          </label>
          <GlassInputWrapper>
            <input
              type="text"
              value={documentValue}
              onChange={handleDocumentChange}
              placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
              className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
              required
            />
          </GlassInputWrapper>
        </div>

        {/* Name Field */}
        <div className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:400ms]">
          <label className="text-sm font-medium text-muted-foreground">
            {documentType === 'cpf' ? 'Nome Completo' : 'Razão Social'}
          </label>
          <GlassInputWrapper>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={documentType === 'cpf' ? 'Seu nome completo' : 'Razão social da empresa'}
              className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
              required
            />
          </GlassInputWrapper>
        </div>

        {/* Email Field */}
        <div className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:500ms]">
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

        {/* Password Field */}
        <div className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:600ms]">
          <label className="text-sm font-medium text-muted-foreground">Senha</label>
          <GlassInputWrapper>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
              </button>
            </div>
          </GlassInputWrapper>
        </div>

        {/* Confirm Password Field */}
        <div className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:700ms]">
          <label className="text-sm font-medium text-muted-foreground">Confirmar Senha</label>
          <GlassInputWrapper>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
              </button>
            </div>
          </GlassInputWrapper>
        </div>

        <button type="submit" className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:800ms] w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Criar Conta
        </button>

        <div className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:850ms] relative flex items-center justify-center">
          <span className="w-full border-t border-border"></span>
          <span className="px-4 text-sm text-muted-foreground bg-background absolute">Ou continue com</span>
        </div>

        <button
          type="button"
          onClick={onGoogleSignUp}
          className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:900ms] w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-4 hover:bg-secondary transition-colors"
        >
          <GoogleIcon />
          Continuar com Google
        </button>

        <p className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:950ms] text-center text-sm text-muted-foreground">
          Já tem uma conta? <a href="#" onClick={(e) => { e.preventDefault(); onBackToLogin?.(); }} className="text-yellow-400 hover:underline transition-colors">Entrar</a>
        </p>
      </form>
    </div>
  );
};