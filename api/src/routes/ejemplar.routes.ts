import { Router } from 'express';
import { EjemplarController } from '../controllers/ejemplar.controller';
import { requierePermiso } from '../middlewares/auth.middleware';
import { validar } from '../middlewares/validate.middleware';
import {
  actualizarEjemplarSchema,
  filtrosEjemplarSchema,
  registrarEjemplaresSchema,
} from '../validators/ejemplar.schema';

export const ejemplarRouter = Router();

const consultar = requierePermiso('catalogo.consultar', 'ejemplares.gestionar');
const gestionar = requierePermiso('ejemplares.gestionar');

ejemplarRouter.get('/', consultar, validar(filtrosEjemplarSchema, 'query'), EjemplarController.listar);
ejemplarRouter.get('/:id', consultar, EjemplarController.obtener);
ejemplarRouter.post('/', gestionar, validar(registrarEjemplaresSchema), EjemplarController.registrar);
ejemplarRouter.put('/:id', gestionar, validar(actualizarEjemplarSchema), EjemplarController.actualizar);
ejemplarRouter.delete('/:id', gestionar, EjemplarController.darDeBaja);
