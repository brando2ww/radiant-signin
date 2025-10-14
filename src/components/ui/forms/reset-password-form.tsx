import React, { useState } from "react";
import { GlassInputWrapper } from '@/components/ui/auth-layout';
import { DocumentInput } from '@/components/ui/document-input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ResetPasswordFormProps {
  onSubmit?: (documentType: string, document: string) => void;
  onBackToLogin?: () => void;
}

type ResetStep = 1 | 2 | 3;

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSubmit,
  onBackToLogin
}) => {
  const [step, setStep] = useState<ResetStep>(1);
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cpf');
  const [document, setDocument] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit?.(documentType, document);
      setStep(3);
    } catch (error) {
      console.error('Erro ao processar redefinição:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setDocument('');
    } else {
      onBackToLogin?.();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 text-4xl md:text-5xl font-semibold leading-tight">
        <span className="font-light text-foreground tracking-tighter">Redefinir Senha</span>
      </h1>
      
      {/* Etapa 1: Escolher tipo de documento */}
      {step === 1 && (
        <>
          <p className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:100ms] text-muted-foreground">
            Escolha o tipo de documento para continuar
          </p>

          <div className="space-y-5">
            <div className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:200ms]">
              <label className="text-sm font-medium text-muted-foreground mb-3 block">Tipo de Documento</label>
              <RadioGroup value={documentType} onValueChange={(value) => setDocumentType(value as 'cpf' | 'cnpj')}>
                <div className="flex items-center space-x-3 p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50">
                  <RadioGroupItem value="cpf" id="cpf" />
                  <Label htmlFor="cpf" className="cursor-pointer flex-1 text-base">CPF</Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50">
                  <RadioGroupItem value="cnpj" id="cnpj" />
                  <Label htmlFor="cnpj" className="cursor-pointer flex-1 text-base">CNPJ</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              onClick={() => setStep(2)} 
              className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:300ms] w-full rounded-2xl py-6"
            >
              Continuar
            </Button>

            <p className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:400ms] text-center text-sm text-muted-foreground">
              Lembrou sua senha? <button type="button" onClick={onBackToLogin} className="text-primary hover:underline transition-colors">Voltar para Login</button>
            </p>
          </div>
        </>
      )}

      {/* Etapa 2: Preencher documento */}
      {step === 2 && (
        <>
          <p className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:100ms] text-muted-foreground">
            Digite seu {documentType === 'cpf' ? 'CPF' : 'CNPJ'} cadastrado
          </p>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:200ms]">
              <label className="text-sm font-medium text-muted-foreground">{documentType === 'cpf' ? 'CPF' : 'CNPJ'}</label>
              <GlassInputWrapper>
                <DocumentInput
                  documentType={documentType}
                  value={document}
                  onChange={setDocument}
                  className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none border-0 focus-visible:ring-0"
                  required
                />
              </GlassInputWrapper>
            </div>

            <div className="flex gap-3 animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:300ms]">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleBack}
                className="flex-1 rounded-2xl py-6"
                disabled={loading}
              >
                Voltar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 rounded-2xl py-6"
                disabled={loading}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </form>
        </>
      )}

      {/* Etapa 3: Confirmação */}
      {step === 3 && (
        <>
          <div className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:100ms] text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Link Enviado!</h2>
            <p className="text-muted-foreground">
              Se este documento estiver cadastrado, você receberá um email com instruções para redefinir sua senha.
            </p>
          </div>

          <Button 
            onClick={onBackToLogin}
            className="animate-[fade-slide-in_0.6s_ease-out_forwards] opacity-0 [animation-delay:200ms] w-full rounded-2xl py-6"
          >
            Voltar para Login
          </Button>
        </>
      )}
    </div>
  );
};