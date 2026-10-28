import { Router } from 'express';
import { CatalogoController } from '../controllers/catalogo.controller';
import { requierePermiso } from '../middlewares/auth.middleware';
import { validar } from '../middlewares/validate.middleware';
import { nombreSchema } from '../validators/libro.schema';

export const catalogoRouter = Router();

catalogoRouter.get('/roles', requierePermiso('usuarios.gestionar'), CatalogoController.roles);
catalogoRouter.get('/autores', CatalogoController.autores);
catalogoRouter.post(
  '/autores',
  requierePermiso('libros.gestionar'),
  validar(nombreSchema),
  CatalogoController.crearAutor,
);
catalogoRouter.get('/temas', CatalogoController.temas);
catalogoRouter.post(
  '/temas',
  requierePermiso('libros.gestionar'),
  validar(nombreSchema),
  CatalogoController.crearTema,
);
catalogoRouter.get('/ubicaciones', CatalogoController.ubicaciones);
