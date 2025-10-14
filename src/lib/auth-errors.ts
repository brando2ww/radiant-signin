import { AuthError } from '@supabase/supabase-js';

export const getAuthErrorMessage = (error: AuthError | Error | null): string => {
  if (!error) return 'Ocorreu um erro. Tente novamente.';
  
  const message = error.message.toLowerCase();
  
  if (message.includes('invalid login credentials')) {
    return 'Email ou senha incorretos';
  }
  
  if (message.includes('email not confirmed')) {
    return 'Por favor, confirme seu email antes de fazer login';
  }
  
  if (message.includes('user already registered')) {
    return 'Este email já está cadastrado';
  }
  
  if (message.includes('invalid email')) {
    return 'Email inválido';
  }
  
  if (message.includes('password')) {
    return 'Senha inválida. Use no mínimo 6 caracteres';
  }
  
  return 'Ocorreu um erro. Tente novamente.';
};
