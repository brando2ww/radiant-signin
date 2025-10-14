import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: 'Email inválido' })
    .max(255, { message: 'Email muito longo' }),
  password: z.string()
    .min(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
    .max(100, { message: 'Senha muito longa' }),
});

export const signUpSchema = z.object({
  documentType: z.enum(['cpf', 'cnpj']),
  document: z.string()
    .trim()
    .min(11, { message: 'Documento inválido' }),
  name: z.string()
    .trim()
    .min(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
    .max(100, { message: 'Nome muito longo' }),
  email: z.string()
    .trim()
    .email({ message: 'Email inválido' })
    .max(255),
  password: z.string()
    .min(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
    .max(100),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: 'Email inválido' })
    .max(255),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
