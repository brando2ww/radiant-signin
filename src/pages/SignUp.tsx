import { SignUpPage } from "@/components/ui/sign-up";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo_velara_preto.png";

const SignUp = () => {
  const navigate = useNavigate();

  const handleSignUp = (data: { documentType: 'cpf' | 'cnpj'; document: string; name: string; email: string; password: string }) => {
    console.log('Sign up data:', data);
    alert(`Conta criada com sucesso!\nTipo: ${data.documentType.toUpperCase()}\nDocumento: ${data.document}\nNome: ${data.name}\nEmail: ${data.email}`);
  };

  const handleGoogleSignUp = () => {
    console.log('Google sign up clicked');
    alert('Login com Google será implementado em breve!');
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <SignUpPage
      logo={logo}
      heroImage="https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
      onSignUp={handleSignUp}
      onGoogleSignUp={handleGoogleSignUp}
      onBackToLogin={handleBackToLogin}
    />
  );
};

export default SignUp;
