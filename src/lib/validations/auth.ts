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
  documentType: z.enum(['cpf', 'cnpj'], {
    errorMap: () => ({ message: 'Selecione o tipo de documento' })
  }),
  document: z.string()
    .trim()
    .min(11, { message: 'Documento inválido' })
    .max(18, { message: 'Documento muito longo' }),
  name: z.string()
    .trim()
    .min(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
    .max(100, { message: 'Nome muito longo' }),
  email: z.string()
    .trim()
    .email({ message: 'Email inválido' })
    .max(255, { message: 'Email muito longo' }),
  password: z.string()
    .min(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
    .max(100, { message: 'Senha muito longa' }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: 'Email inválido' })
    .max(255, { message: 'Email muito longo' }),
});

export const resetPasswordByDocumentSchema = z.object({
  documentType: z.enum(['cpf', 'cnpj'], {
    errorMap: () => ({ message: 'Selecione o tipo de documento' })
  }),
  document: z.string()
    .trim()
    .min(11, { message: 'Documento inválido' })
    .max(18, { message: 'Documento inválido' })
    .refine((doc) => {
      const cleanDoc = doc.replace(/\D/g, '');
      return cleanDoc.length === 11 || cleanDoc.length === 14;
    }, { message: 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos' })
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordByDocumentInput = z.infer<typeof resetPasswordByDocumentSchema>;
