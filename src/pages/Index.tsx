import { useState } from "react";
import { Testimonial } from "@/components/ui/sign-in";
import { AuthLayout } from "@/components/ui/auth-layout";
import { LoginForm } from "@/components/ui/forms/login-form";
import { SignUpForm } from "@/components/ui/forms/signup-form";
import { ResetPasswordForm } from "@/components/ui/forms/reset-password-form";
import logo from "@/assets/logo_velara_preto.png";

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
  const [currentForm, setCurrentForm] = useState<FormType>('login');

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Login enviado:", data);
    alert(`Login Enviado! Verifique o console do navegador para os dados do formulário.`);
  };

  const handleSignUp = (data: { documentType: string; document: string; name: string; email: string; password: string }) => {
    console.log("Cadastro enviado:", data);
    alert(`Cadastro Enviado! Verifique o console do navegador para os dados do formulário.`);
  };

  const handleResetPassword = (email: string) => {
    console.log('Reset password for:', email);
    alert(`Link de redefinição enviado para: ${email}\n\nVerifique sua caixa de entrada!`);
  };

  const handleGoogleSignIn = () => {
    console.log("Continuar com Google clicado");
    alert("Continuar com Google clicado");
  };

  return (
    <AuthLayout 
      logo={logo}
      heroImage="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
      testimonials={sampleTestimonials}
    >
      <div className="animate-fade-in" key={currentForm}>
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
