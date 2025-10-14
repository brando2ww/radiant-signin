import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import logo from "@/assets/logo_velara_preto.png";

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
  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Login enviado:", data);
    alert(`Login Enviado! Verifique o console do navegador para os dados do formulário.`);
  };

  const handleGoogleSignIn = () => {
    console.log("Continuar com Google clicado");
    alert("Continuar com Google clicado");
  };
  
  const handleResetPassword = () => {
    alert("Redefinir Senha clicado");
  };

  const handleCreateAccount = () => {
    alert("Criar Conta clicado");
  };

  return (
    <SignInPage
      title={
        <div className="flex flex-col gap-4 items-start self-start">
          <img src={logo} alt="Velara" className="h-[63px] w-auto dark:invert" />
          <span className="font-light text-foreground tracking-tighter">Bem-vindo</span>
        </div>
      }
      heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
      testimonials={sampleTestimonials}
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
    />
  );
};

export default Index;
