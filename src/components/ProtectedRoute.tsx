import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSuperAdmin } from '@/hooks/use-super-admin';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isSuperAdmin, isLoading: superAdminLoading } = useSuperAdmin();
  
  if (loading || superAdminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Super admin não pode acessar o PDV — redireciona para /admin
  if (isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};
