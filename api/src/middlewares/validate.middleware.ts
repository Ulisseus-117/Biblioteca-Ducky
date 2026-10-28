import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { HttpError } from '../utils/http-error';

type Origen = 'body' | 'query' | 'params';

/**
 * Valida y normaliza req[origen] con un esquema zod.
 * El resultado queda en res.locals[origen] para que el controlador lo use ya tipado.
 */
export function validar(esquema: ZodType, origen: Origen = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const resultado = esquema.safeParse(req[origen]);
    if (!resultado.success) {
      const primerError = resultado.error.issues[0];
      throw HttpError.badRequest(primerError.message, 'DATOS_INVALIDOS');
    }
    res.locals[origen] = resultado.data;
    next();
  };
}
