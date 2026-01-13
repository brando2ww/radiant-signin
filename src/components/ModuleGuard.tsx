import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserModules, UserModule } from '@/hooks/use-user-modules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface ModuleGuardProps {
  module: UserModule;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ModuleGuard({ module, children, fallback }: ModuleGuardProps) {
  const { hasModule, isLoading, modules } = useUserModules();

  // Allow development/testing without module restrictions
  // TODO: Remove or configure this in production
  const bypassModuleCheck = true;

  if (bypassModuleCheck) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasModule(module)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Módulo não disponível</CardTitle>
            <CardDescription>
              Você não tem acesso ao módulo <strong>{module}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Para acessar este módulo, você precisa adquiri-lo primeiro.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => window.history.back()}>
                Voltar
              </Button>
              <Button className="flex-1" onClick={() => (window.location.href = '/plans')}>
                Ver Planos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
