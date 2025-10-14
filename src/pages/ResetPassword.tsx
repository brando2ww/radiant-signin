import { ResetPasswordPage } from "@/components/ui/reset-password";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo_velara_preto.png";

const ResetPassword = () => {
  const navigate = useNavigate();

  const handleResetPassword = (email: string) => {
    console.log('Reset password for:', email);
    alert(`Link de redefinição enviado para: ${email}\n\nVerifique sua caixa de entrada!`);
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <ResetPasswordPage
      logo={logo}
      heroImage="https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
      onResetPassword={handleResetPassword}
      onBackToLogin={handleBackToLogin}
    />
  );
};

export default ResetPassword;
