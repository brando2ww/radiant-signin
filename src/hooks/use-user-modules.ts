import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserModule = 'financeiro' | 'crm' | 'delivery' | 'pdv' | 'avaliacoes';

interface ModuleAccess {
  id: string;
  user_id: string;
  module: UserModule;
  is_active: boolean;
  acquired_at: string;
  expires_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useUserModules() {
  const { user } = useAuth();

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['user-modules', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_modules')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data as ModuleAccess[];
    },
    enabled: !!user,
  });

  const hasModule = (module: UserModule): boolean => {
    if (!user) return false;

    const moduleAccess = modules.find((m) => m.module === module);
    if (!moduleAccess) return false;

    // Verificar se não expirou
    if (moduleAccess.expires_at) {
      const expirationDate = new Date(moduleAccess.expires_at);
      if (expirationDate < new Date()) return false;
    }

    return true;
  };

  const isModuleExpired = (module: UserModule): boolean => {
    const moduleAccess = modules.find((m) => m.module === module);
    if (!moduleAccess || !moduleAccess.expires_at) return false;

    const expirationDate = new Date(moduleAccess.expires_at);
    return expirationDate < new Date();
  };

  const isModuleTrial = (module: UserModule): boolean => {
    const moduleAccess = modules.find((m) => m.module === module);
    if (!moduleAccess || !moduleAccess.trial_ends_at) return false;

    const trialEndDate = new Date(moduleAccess.trial_ends_at);
    return trialEndDate > new Date();
  };

  const getModuleExpirationDate = (module: UserModule): Date | null => {
    const moduleAccess = modules.find((m) => m.module === module);
    if (!moduleAccess || !moduleAccess.expires_at) return null;

    return new Date(moduleAccess.expires_at);
  };

  const getTrialEndDate = (module: UserModule): Date | null => {
    const moduleAccess = modules.find((m) => m.module === module);
    if (!moduleAccess || !moduleAccess.trial_ends_at) return null;

    return new Date(moduleAccess.trial_ends_at);
  };

  return {
    modules,
    isLoading,
    hasModule,
    isModuleExpired,
    isModuleTrial,
    getModuleExpirationDate,
    getTrialEndDate,
  };
}
