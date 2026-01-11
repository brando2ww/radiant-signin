import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout, Testimonial } from "@/components/ui/auth-layout";
import { LoginForm } from "@/components/ui/forms/login-form";
import { SignUpForm } from "@/components/ui/forms/signup-form";
import { ResetPasswordForm } from "@/components/ui/forms/reset-password-form";
import { TwoFactorDialog } from "@/components/auth/TwoFactorDialog";
import { useAuth } from "@/contexts/AuthContext";
import { use2FA } from "@/hooks/use-2fa";
import { toast } from "sonner";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { supabase } from "@/integrations/supabase/client";

type FormType = 'login' | 'signup' | 'reset';

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Ana Silva",
    handle: "@anadigital",
    text: "Plataforma incrível! A experiência do usuário é perfeita e os recursos são exatamente o que eu precisava."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Bruno Oliveira",
    handle: "@brunotech",
    text: "Este serviço transformou minha forma de trabalhar. Design limpo, recursos poderosos e excelente suporte."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Lucas Ferreira",
    handle: "@lucascria",
    text: "Já experimentei muitas plataformas, mas esta se destaca. Intuitiva, confiável e genuinamente útil para produtividade."
  },
];

const Index = () => {
  const { signUp, resetPasswordByDocument, signInWithGoogle, user, loading } = useAuth();
  const [currentForm, setCurrentForm] = useState<FormType>('login');
  const navigate = useNavigate();

  // 2FA state
  const {
    isSending,
    isVerifying,
    codeSent,
    expiresAt,
    phoneLastDigits,
    check2FARequired,
    send2FACode,
    verify2FACode,
    reset: reset2FA,
  } = use2FA();

  const [show2FADialog, setShow2FADialog] = useState(false);
  const [pending2FAUserId, setPending2FAUserId] = useState<string | null>(null);
  const [pendingSession, setPendingSession] = useState<unknown>(null);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (user && !loading && !show2FADialog) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate, show2FADialog]);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(getAuthErrorMessage(error));
        return;
      }

      if (data.user) {
        // Check if 2FA is required
        const requires2FA = await check2FARequired(data.user.id);

        if (requires2FA) {
          // Store user info and sign out temporarily
          setPending2FAUserId(data.user.id);
          setPendingSession(data.session);
          
          // Sign out but keep the pending state
          await supabase.auth.signOut();

          // Send 2FA code
          const sent = await send2FACode(data.user.id);
          if (sent) {
            setShow2FADialog(true);
            toast.info("Código de verificação enviado para seu WhatsApp");
          } else {
            toast.error("Erro ao enviar código de verificação");
            reset2FA();
            setPending2FAUserId(null);
            setPendingSession(null);
          }
          return;
        }

        // No 2FA required, proceed with login
        toast.success('Login realizado com sucesso!');
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      toast.error("Erro ao fazer login");
    }
  };

  const handle2FAVerify = async (code: string) => {
    if (!pending2FAUserId) return;

    const valid = await verify2FACode(pending2FAUserId, code);

    if (valid) {
      // Re-authenticate the user
      // We need to use the stored session or re-login
      setShow2FADialog(false);
      reset2FA();
      
      // The user needs to login again after 2FA verification
      // Since we signed them out, we need to restore the session
      // For now, we'll ask them to enter credentials again
      toast.success("Verificação 2FA concluída! Faça login novamente.");
      setPending2FAUserId(null);
      setPendingSession(null);
    } else {
      toast.error("Código inválido ou expirado");
    }
  };

  const handle2FAResend = async () => {
    if (!pending2FAUserId) return;
    
    const sent = await send2FACode(pending2FAUserId);
    if (sent) {
      toast.success("Novo código enviado para seu WhatsApp");
    } else {
      toast.error("Erro ao reenviar código");
    }
  };

  const handle2FACancel = () => {
    setShow2FADialog(false);
    reset2FA();
    setPending2FAUserId(null);
    setPendingSession(null);
  };

  const handleSignUp = async (data: { documentType: string; document: string; name: string; email: string; password: string }) => {
    const { error } = await signUp({
      email: data.email,
      password: data.password,
      name: data.name,
      documentType: data.documentType,
      document: data.document,
    });
    
    if (error) {
      toast.error(getAuthErrorMessage(error));
      return;
    }
    
    toast.success('Cadastro realizado! Verifique seu email para confirmar.');
    setCurrentForm('login');
  };

  const handleResetPassword = async (documentType: string, document: string) => {
    const { success, error } = await resetPasswordByDocument(documentType, document);
    
    if (!success && error) {
      toast.error('Ocorreu um erro. Tente novamente.');
      return;
    }
    
    // Sempre mostra mensagem de sucesso por segurança
    toast.success('Se este documento estiver cadastrado, você receberá um email com instruções.');
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast.error(getAuthErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthLayout testimonials={sampleTestimonials}>
        <div key={currentForm} className="animate-fade-in">
          {currentForm === 'login' && (
            <LoginForm
              onSubmit={handleSignIn}
              onGoogleSignIn={handleGoogleSignIn}
              onResetPassword={() => setCurrentForm('reset')}
              onCreateAccount={() => setCurrentForm('signup')}
            />
          )}

          {currentForm === 'signup' && (
            <SignUpForm
              onSubmit={handleSignUp}
              onGoogleSignUp={handleGoogleSignIn}
              onBackToLogin={() => setCurrentForm('login')}
            />
          )}

          {currentForm === 'reset' && (
            <ResetPasswordForm
              onSubmit={handleResetPassword}
              onBackToLogin={() => setCurrentForm('login')}
            />
          )}
        </div>
      </AuthLayout>

      {/* 2FA Dialog */}
      <TwoFactorDialog
        open={show2FADialog}
        onOpenChange={setShow2FADialog}
        phoneLastDigits={phoneLastDigits}
        expiresAt={expiresAt}
        isSending={isSending}
        isVerifying={isVerifying}
        onVerify={handle2FAVerify}
        onResend={handle2FAResend}
        onCancel={handle2FACancel}
      />
    </>
  );
};

export default Index;
