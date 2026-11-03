import type { Request, Response } from 'express';
import { PerfilService } from '../services/perfil.service';

export const PerfilController = {
  async listar(_req: Request, res: Response): Promise<void> {
    res.json(await PerfilService.listar());
  },

  async permisos(_req: Request, res: Response): Promise<void> {
    res.json(await PerfilService.permisos());
  },

  async obtener(req: Request<{ idRol: string }>, res: Response): Promise<void> {
    res.json(await PerfilService.obtener(Number(req.params.idRol)));
  },

  async crear(_req: Request, res: Response): Promise<void> {
    res.status(201).json(await PerfilService.crear(res.locals.body));
  },

  async actualizarPermisos(req: Request<{ idRol: string }>, res: Response): Promise<void> {
    res.json(await PerfilService.actualizarPermisos(Number(req.params.idRol), res.locals.body.permisos));
  },
};
