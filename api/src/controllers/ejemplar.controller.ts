import type { Request, Response } from 'express';
import { EjemplarService } from '../services/ejemplar.service';

export const EjemplarController = {
  async listar(_req: Request, res: Response): Promise<void> {
    res.json(await EjemplarService.listar(res.locals.query));
  },

  async obtener(req: Request<{ id: string }>, res: Response): Promise<void> {
    res.json(await EjemplarService.obtener(Number(req.params.id)));
  },

  async registrar(_req: Request, res: Response): Promise<void> {
    const { isbn, cantidad, modalidad, idUbicacion } = res.locals.body;
    const ids = await EjemplarService.registrar(isbn, cantidad, modalidad, idUbicacion);
    res.status(201).json({ ids });
  },

  async actualizar(req: Request<{ id: string }>, res: Response): Promise<void> {
    res.json(await EjemplarService.actualizar(Number(req.params.id), res.locals.body));
  },

  async darDeBaja(req: Request<{ id: string }>, res: Response): Promise<void> {
    res.json(await EjemplarService.darDeBaja(Number(req.params.id)));
  },
};
