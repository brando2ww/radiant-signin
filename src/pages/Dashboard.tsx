import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <Button onClick={handleSignOut} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Perfil
              </CardTitle>
              <CardDescription>
                Seus dados cadastrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="text-lg font-medium">{profile?.full_name || 'Não informado'}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-medium">{user?.email}</p>
              </div>
              
              {profile?.document_type && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {profile.document_type === 'cpf' ? 'CPF' : 'CNPJ'}
                  </p>
                  <p className="text-lg font-medium">{profile.document}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground">Membro desde</p>
                <p className="text-lg font-medium">
                  {profile?.created_at 
                    ? new Date(profile.created_at).toLocaleDateString('pt-BR')
                    : 'Não disponível'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo!</CardTitle>
              <CardDescription>
                Este é o seu painel de controle. Aqui você pode gerenciar suas informações e acessar os recursos da plataforma.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
