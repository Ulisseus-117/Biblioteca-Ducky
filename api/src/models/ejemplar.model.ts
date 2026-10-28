import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import { calcularOffset, columnaOrden, direccionOrden, Pagina, TAMANO_PAGINA } from '../utils/pagination';

export const MODALIDADES = ['Consulta interna', 'Consulta externa'] as const;
export const ESTADOS_EJEMPLAR = [
  'Disponible',
  'Prestado',
  'Reservado',
  'Perdido',
  'Robado',
  'Dañado',
  'Obsoleto',
] as const;

export type Modalidad = (typeof MODALIDADES)[number];
export type EstadoEjemplar = (typeof ESTADOS_EJEMPLAR)[number];

export interface Ejemplar {
  idEjemplar: number;
  isbn: string;
  titulo: string;
  idUbicacion: number;
  estante: number;
  seccion: number;
  modalidad: Modalidad;
  estado: EstadoEjemplar;
}

export interface FiltrosEjemplar {
  isbn?: string;
  idEjemplar?: number;
  estado?: EstadoEjemplar;
  modalidad?: Modalidad;
  idUbicacion?: number;
  orden?: string;
  dir?: string;
  pagina: number;
}

export interface ResumenExistencias {
  existencias: number;
  disponibles: number;
}

const COLUMNAS_ORDEN = {
  id: 'e.id_ejemplar',
  estado: 'e.estado',
  modalidad: 'e.modalidad',
  ubicacion: 'u.estante, u.seccion',
};

const SELECT_EJEMPLAR = `
  SELECT e.id_ejemplar AS idEjemplar, e.isbn, l.titulo, e.id_ubicacion AS idUbicacion,
         u.estante, u.seccion, e.modalidad, e.estado
    FROM ejemplar e
    JOIN libro l ON l.isbn = e.isbn
    JOIN ubicacion u ON u.id_ubicacion = e.id_ubicacion`;

function construirFiltros(filtros: FiltrosEjemplar): { where: string; valores: unknown[] } {
  const condiciones: string[] = [];
  const valores: unknown[] = [];
  if (filtros.isbn) {
    condiciones.push('e.isbn = ?');
    valores.push(filtros.isbn);
  }
  if (filtros.idEjemplar) {
    condiciones.push('e.id_ejemplar = ?');
    valores.push(filtros.idEjemplar);
  }
  if (filtros.estado) {
    condiciones.push('e.estado = ?');
    valores.push(filtros.estado);
  }
  if (filtros.modalidad) {
    condiciones.push('e.modalidad = ?');
    valores.push(filtros.modalidad);
  }
  if (filtros.idUbicacion) {
    condiciones.push('e.id_ubicacion = ?');
    valores.push(filtros.idUbicacion);
  }
  return { where: condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '', valores };
}

export const EjemplarModel = {
  async listar(filtros: FiltrosEjemplar): Promise<Pagina<Ejemplar> & ResumenExistencias> {
    const { where, valores } = construirFiltros(filtros);
    const orden = columnaOrden(filtros.orden, COLUMNAS_ORDEN, 'id');
    const [filas] = await pool.query<RowDataPacket[]>(
      `${SELECT_EJEMPLAR} ${where} ORDER BY ${orden} ${direccionOrden(filtros.dir)}, e.id_ejemplar LIMIT ? OFFSET ?`,
      [...valores, TAMANO_PAGINA, calcularOffset(filtros.pagina)],
    );
    const [conteo] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total, COALESCE(SUM(e.estado = 'Disponible'), 0) AS disponibles
         FROM ejemplar e JOIN ubicacion u ON u.id_ubicacion = e.id_ubicacion ${where}`,
      valores,
    );
    return {
      datos: filas as Ejemplar[],
      total: conteo[0].total,
      pagina: filtros.pagina,
      tamanoPagina: TAMANO_PAGINA,
      existencias: conteo[0].total,
      disponibles: Number(conteo[0].disponibles),
    };
  },

  async buscarPorId(idEjemplar: number): Promise<Ejemplar | null> {
    const [filas] = await pool.query<RowDataPacket[]>(`${SELECT_EJEMPLAR} WHERE e.id_ejemplar = ?`, [
      idEjemplar,
    ]);
    return (filas[0] as Ejemplar) ?? null;
  },

  /** Registra N copias nuevas en estado Disponible. Devuelve los IDs creados. */
  async crearVarios(
    isbn: string,
    cantidad: number,
    modalidad: Modalidad,
    idUbicacion: number,
  ): Promise<number[]> {
    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();
      const ids: number[] = [];
      for (let i = 0; i < cantidad; i++) {
        const [resultado] = await conexion.execute<ResultSetHeader>(
          `INSERT INTO ejemplar (isbn, id_ubicacion, modalidad, estado) VALUES (?, ?, ?, 'Disponible')`,
          [isbn, idUbicacion, modalidad],
        );
        ids.push(resultado.insertId);
      }
      await conexion.commit();
      return ids;
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  },

  async actualizar(
    idEjemplar: number,
    cambios: { modalidad: Modalidad; idUbicacion: number; estado: EstadoEjemplar },
  ): Promise<void> {
    await pool.execute(
      'UPDATE ejemplar SET modalidad = ?, id_ubicacion = ?, estado = ? WHERE id_ejemplar = ?',
      [cambios.modalidad, cambios.idUbicacion, cambios.estado, idEjemplar],
    );
  },

  async cambiarEstado(idEjemplar: number, estado: EstadoEjemplar): Promise<void> {
    await pool.execute('UPDATE ejemplar SET estado = ? WHERE id_ejemplar = ?', [estado, idEjemplar]);
  },

  async tienePrestamoActivo(idEjemplar: number): Promise<boolean> {
    const [filas] = await pool.query<RowDataPacket[]>(
      'SELECT 1 FROM prestamo WHERE id_ejemplar = ? AND fecha_devolucion_real IS NULL LIMIT 1',
      [idEjemplar],
    );
    return filas.length > 0;
  },

  async tieneHistorial(idEjemplar: number): Promise<boolean> {
    const [filas] = await pool.query<RowDataPacket[]>(
      'SELECT 1 FROM prestamo WHERE id_ejemplar = ? LIMIT 1',
      [idEjemplar],
    );
    return filas.length > 0;
  },

  async eliminar(idEjemplar: number): Promise<void> {
    await pool.execute('DELETE FROM ejemplar WHERE id_ejemplar = ?', [idEjemplar]);
  },
};
