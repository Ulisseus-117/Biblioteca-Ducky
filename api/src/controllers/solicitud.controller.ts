import type { Request, Response } from 'express';
import { SolicitudService } from '../services/solicitud.service';

export const SolicitudController = {
  async listar(_req: Request, res: Response): Promise<void> {
    res.json(await SolicitudService.listar(res.locals.query));
  },

  async obtener(req: Request<{ id: string }>, res: Response): Promise<void> {
    res.json(await SolicitudService.obtener(Number(req.params.id)));
  },

  async crear(req: Request, res: Response): Promise<void> {
    res.status(201).json(await SolicitudService.crear(req.usuario!.matricula, res.locals.body.lineas));
  },

  async cambiarEstado(req: Request<{ id: string }>, res: Response): Promise<void> {
    res.json(await SolicitudService.cambiarEstado(Number(req.params.id), res.locals.body.estado));
  },
};
