import { z } from 'zod';

export const loginSchema = z.object({
  matricula: z
    .string({ error: 'Completa usuario y contraseña' })
    .trim()
    .min(1, 'Completa usuario y contraseña'),
  contrasena: z.string({ error: 'Completa usuario y contraseña' }).min(1, 'Completa usuario y contraseña'),
});
