import { Router } from 'express';
import { LibroController } from '../controllers/libro.controller';
import { requierePermiso } from '../middlewares/auth.middleware';
import { validar } from '../middlewares/validate.middleware';
import { filtrosLibroSchema, libroSchema } from '../validators/libro.schema';

export const libroRouter = Router();

const consultar = requierePermiso('catalogo.consultar', 'libros.gestionar');
const gestionar = requierePermiso('libros.gestionar');

libroRouter.get('/', consultar, validar(filtrosLibroSchema, 'query'), LibroController.listar);
libroRouter.get('/opciones', consultar, LibroController.opciones);
libroRouter.get('/:isbn', consultar, LibroController.obtener);
libroRouter.post('/', gestionar, validar(libroSchema), LibroController.crear);
libroRouter.put('/:isbn', gestionar, validar(libroSchema), LibroController.actualizar);
libroRouter.delete('/:isbn', gestionar, LibroController.eliminar);
