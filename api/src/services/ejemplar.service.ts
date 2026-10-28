import { CatalogoModel } from '../models/catalogo.model';
import {
  Ejemplar,
  EjemplarModel,
  EstadoEjemplar,
  FiltrosEjemplar,
  Modalidad,
} from '../models/ejemplar.model';
import { LibroModel } from '../models/libro.model';
import { HttpError } from '../utils/http-error';

/** Estos estados solo cambian por los procesos de préstamo, reserva y devolución. */
const ESTADOS_AUTOMATICOS: EstadoEjemplar[] = ['Prestado', 'Reservado'];

async function obtenerEjemplar(idEjemplar: number): Promise<Ejemplar> {
  const ejemplar = await EjemplarModel.buscarPorId(idEjemplar);
  if (!ejemplar) throw HttpError.notFound('No se encontró el ejemplar');
  return ejemplar;
}

async function validarUbicacion(idUbicacion: number): Promise<void> {
  if (!(await CatalogoModel.existeUbicacion(idUbicacion))) {
    throw HttpError.badRequest('Selecciona una ubicación válida');
  }
}

export const EjemplarService = {
  listar(filtros: FiltrosEjemplar) {
    return EjemplarModel.listar(filtros);
  },

  obtener: obtenerEjemplar,

  async registrar(
    isbn: string,
    cantidad: number,
    modalidad: Modalidad,
    idUbicacion: number,
  ): Promise<number[]> {
    if (!(await LibroModel.existe(isbn))) throw HttpError.notFound('El libro seleccionado no existe');
    await validarUbicacion(idUbicacion);
    return EjemplarModel.crearVarios(isbn, cantidad, modalidad, idUbicacion);
  },

  async actualizar(
    idEjemplar: number,
    cambios: { modalidad: Modalidad; idUbicacion: number; estado: EstadoEjemplar },
  ): Promise<Ejemplar> {
    const ejemplar = await obtenerEjemplar(idEjemplar);
    const cambiaEstado = cambios.estado !== ejemplar.estado;
    if (
      cambiaEstado &&
      (ESTADOS_AUTOMATICOS.includes(cambios.estado) || ESTADOS_AUTOMATICOS.includes(ejemplar.estado))
    ) {
      throw HttpError.conflict(
        'Los estados Prestado y Reservado solo cambian por los procesos de préstamo, reserva y devolución.',
        'ESTADO_MANUAL_NO_PERMITIDO',
      );
    }
    await validarUbicacion(cambios.idUbicacion);
    await EjemplarModel.actualizar(idEjemplar, cambios);
    return obtenerEjemplar(idEjemplar);
  },

  /**
   * Retira el ejemplar del inventario. Si tiene historial de préstamos, la fila se conserva
   * (la BD no permite borrar ese historial) y se marca como Obsoleto.
   */
  async darDeBaja(idEjemplar: number): Promise<{ eliminado: boolean }> {
    const ejemplar = await obtenerEjemplar(idEjemplar);
    if (
      ESTADOS_AUTOMATICOS.includes(ejemplar.estado) ||
      (await EjemplarModel.tienePrestamoActivo(idEjemplar))
    ) {
      throw HttpError.conflict(
        `No se puede eliminar: el ejemplar está ${ejemplar.estado.toLowerCase()}. Espera a que se devuelva o se libere la reserva.`,
        'EJEMPLAR_OCUPADO',
      );
    }
    if (await EjemplarModel.tieneHistorial(idEjemplar)) {
      if (ejemplar.estado === 'Disponible') await EjemplarModel.cambiarEstado(idEjemplar, 'Obsoleto');
      return { eliminado: false };
    }
    await EjemplarModel.eliminar(idEjemplar);
    return { eliminado: true };
  },
};
