import { useAuth } from '@/contexts/AuthContext';
import { SessionNavBar } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

const Dashboard = () => {
  const { user, profile } = useAuth();

  return (
    <div className="flex h-screen w-full flex-row">
      <SessionNavBar />
      <main className="ml-[3.05rem] flex h-screen grow flex-col overflow-auto p-8">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Bem-vindo de volta!</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Perfil
                </CardTitle>
                <CardDescription>Seus dados cadastrados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{profile?.full_name || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                {profile?.document_type && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {profile.document_type.toUpperCase()}
                    </p>
                    <p className="font-medium">{profile.document || 'Não informado'}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Início Rápido</CardTitle>
                <CardDescription>Comece a usar a plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Você está autenticado e pronto para usar todas as funcionalidades da plataforma.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
