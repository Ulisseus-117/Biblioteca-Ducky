import { z } from 'zod';
import { numeroOpcional, ordenQuery, textoOpcional } from './comunes';

const anioActual = new Date().getFullYear();
const textoNullable = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
  z.string().trim().max(150).nullish(),
);

export const libroSchema = z.object({
  titulo: z.string({ error: 'El título es obligatorio' }).trim().min(1, 'El título es obligatorio').max(255),
  isbn: z
    .string({ error: 'El ISBN es obligatorio' })
    .trim()
    .min(1, 'El ISBN es obligatorio')
    .regex(/^[0-9Xx-]{10,20}$/, 'El ISBN solo admite dígitos, guiones y X (10 a 20 caracteres)'),
  editorial: textoNullable,
  anio: z.number().int().min(1000, 'Año inválido').max(anioActual, 'Año inválido').nullish(),
  idioma: textoNullable,
  precioUltimaCompraUsd: z.number().min(0, 'El precio no puede ser negativo').nullish(),
  idAutores: z.array(z.number().int().positive()).min(1, 'Selecciona al menos un autor'),
  idTemas: z.array(z.number().int().positive()).default([]),
});

export const filtrosLibroSchema = z.object({
  q: textoOpcional,
  titulo: textoOpcional,
  autor: textoOpcional,
  idTema: numeroOpcional,
  isbn: textoOpcional,
  editorial: textoOpcional,
  anio: numeroOpcional,
  ejemplaresMin: numeroOpcional,
  ejemplaresMax: numeroOpcional,
  ...ordenQuery,
});

export const nombreSchema = z.object({
  nombre: z.string({ error: 'El nombre es obligatorio' }).trim().min(1, 'El nombre es obligatorio').max(200),
});
