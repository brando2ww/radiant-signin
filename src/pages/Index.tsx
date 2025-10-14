import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout, Testimonial } from "@/components/ui/auth-layout";
import { LoginForm } from "@/components/ui/forms/login-form";
import { SignUpForm } from "@/components/ui/forms/signup-form";
import { ResetPasswordForm } from "@/components/ui/forms/reset-password-form";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getAuthErrorMessage } from "@/lib/auth-errors";

type FormType = 'login' | 'signup' | 'reset';

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Plataforma incrível! A experiência do usuário é perfeita e os recursos são exatamente o que eu precisava."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "Este serviço transformou minha forma de trabalhar. Design limpo, recursos poderosos e excelente suporte."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "Já experimentei muitas plataformas, mas esta se destaca. Intuitiva, confiável e genuinamente útil para produtividade."
  },
];

const Index = () => {
  const { signIn, signUp, resetPassword, signInWithGoogle, user, loading } = useAuth();
  const [currentForm, setCurrentForm] = useState<FormType>('login');
  const navigate = useNavigate();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error(getAuthErrorMessage(error));
      return;
    }
    
    toast.success('Login realizado com sucesso!');
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

  const handleResetPassword = async (email: string) => {
    const { error } = await resetPassword(email);
    
    if (error) {
      toast.error(getAuthErrorMessage(error));
      return;
    }
    
    toast.success(`Link de redefinição enviado para: ${email}`);
    setCurrentForm('login');
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
  );
};

export default Index;
