import { pool } from '../config/database';
import { CatalogoModel } from '../models/catalogo.model';
import { LibroModel } from '../models/libro.model';
import { EstadoSolicitud, FiltrosSolicitud, Solicitud, SolicitudModel } from '../models/solicitud.model';
import { HttpError } from '../utils/http-error';

export interface LineaNuevaSolicitud {
  isbn: string;
  numEjemplares: number;
  costoUnitario: number;
  libroNuevo?: { titulo: string; autor: string };
}

async function obtenerSolicitud(idSolicitud: number): Promise<Solicitud> {
  const solicitud = await SolicitudModel.buscarPorId(idSolicitud);
  if (!solicitud) throw HttpError.notFound('No se encontró la solicitud');
  return solicitud;
}

export const SolicitudService = {
  listar(filtros: FiltrosSolicitud) {
    return SolicitudModel.listar(filtros);
  },

  obtener: obtenerSolicitud,

  /**
   * Genera la solicitud para Tesorería. Los libros nuevos se dan de alta primero en el
   * catálogo (con 0 ejemplares) y después se agregan como línea de la solicitud.
   */
  async crear(matricula: string, lineas: LineaNuevaSolicitud[]): Promise<Solicitud> {
    const isbns = lineas.map((l) => l.isbn);
    if (new Set(isbns).size !== isbns.length) {
      throw HttpError.badRequest('Un libro aparece más de una vez. Suma los ejemplares en una sola línea.');
    }

    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();
      for (const linea of lineas) {
        const existe = await LibroModel.existe(linea.isbn);
        if (linea.libroNuevo && !existe) {
          const idAutor = await CatalogoModel.buscarOCrearAutor(linea.libroNuevo.autor, conexion);
          await LibroModel.crear(
            { isbn: linea.isbn, titulo: linea.libroNuevo.titulo, idAutores: [idAutor], idTemas: [] },
            conexion,
          );
        } else if (!existe) {
          throw HttpError.badRequest(`El libro con ISBN ${linea.isbn} no existe en el catálogo`);
        }
      }
      const idSolicitud = await SolicitudModel.crear(conexion, matricula, lineas);
      await conexion.commit();
      return obtenerSolicitud(idSolicitud);
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  },

  async cambiarEstado(idSolicitud: number, estado: EstadoSolicitud): Promise<Solicitud> {
    await obtenerSolicitud(idSolicitud);
    await SolicitudModel.cambiarEstado(idSolicitud, estado);
    return obtenerSolicitud(idSolicitud);
  },
};
