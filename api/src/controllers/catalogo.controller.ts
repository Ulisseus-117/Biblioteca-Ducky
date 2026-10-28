import type { Request, Response } from 'express';
import { CatalogoModel } from '../models/catalogo.model';
import { RolModel } from '../models/rol.model';
import { HttpError } from '../utils/http-error';

/** Catálogos pequeños de apoyo (roles, autores, temas, ubicaciones). No tienen reglas de negocio. */
export const CatalogoController = {
  async roles(_req: Request, res: Response): Promise<void> {
    res.json(await RolModel.listar());
  },

  async autores(_req: Request, res: Response): Promise<void> {
    res.json(await CatalogoModel.listarAutores());
  },

  async crearAutor(_req: Request, res: Response): Promise<void> {
    res.status(201).json(await CatalogoModel.crearAutor(res.locals.body.nombre));
  },

  async temas(_req: Request, res: Response): Promise<void> {
    res.json(await CatalogoModel.listarTemas());
  },

  async crearTema(_req: Request, res: Response): Promise<void> {
    const { nombre } = res.locals.body;
    if (await CatalogoModel.buscarTemaPorNombre(nombre)) throw HttpError.conflict('Ese tema ya existe');
    res.status(201).json(await CatalogoModel.crearTema(nombre));
  },

  async ubicaciones(_req: Request, res: Response): Promise<void> {
    res.json(await CatalogoModel.listarUbicaciones());
  },
};
