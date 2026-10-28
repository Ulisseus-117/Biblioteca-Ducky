import type { Request, Response } from 'express';
import { LibroService } from '../services/libro.service';

export const LibroController = {
  async listar(_req: Request, res: Response): Promise<void> {
    res.json(await LibroService.listar(res.locals.query));
  },

  async opciones(_req: Request, res: Response): Promise<void> {
    res.json(await LibroService.listarOpciones());
  },

  async obtener(req: Request<{ isbn: string }>, res: Response): Promise<void> {
    res.json(await LibroService.obtener(req.params.isbn));
  },

  async crear(_req: Request, res: Response): Promise<void> {
    res.status(201).json(await LibroService.crear(res.locals.body));
  },

  async actualizar(req: Request<{ isbn: string }>, res: Response): Promise<void> {
    res.json(await LibroService.actualizar(req.params.isbn, res.locals.body));
  },

  async eliminar(req: Request<{ isbn: string }>, res: Response): Promise<void> {
    await LibroService.eliminar(req.params.isbn);
    res.status(204).end();
  },
};
