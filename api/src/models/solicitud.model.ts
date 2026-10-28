import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { pool } from '../config/database';
import { calcularOffset, columnaOrden, direccionOrden, Pagina, TAMANO_PAGINA } from '../utils/pagination';

export const ESTADOS_SOLICITUD = ['Enviado a tesorería', 'Aceptado', 'Rechazado'] as const;
export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number];

export interface SolicitudResumen {
  idSolicitud: number;
  matricula: string;
  fecha: string;
  estado: EstadoSolicitud;
  numLibrosDiferentes: number;
  numEjemplaresTotales: number;
  total: number;
}

export interface DetalleSolicitud {
  idDetalleSolicitud: number;
  isbn: string;
  titulo: string;
  autores: string | null;
  numEjemplares: number;
  costoUnitario: number;
  subtotal: number;
}

export interface Solicitud extends SolicitudResumen {
  detalles: DetalleSolicitud[];
}

export interface FiltrosSolicitud {
  folio?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: EstadoSolicitud;
  costoMin?: number;
  costoMax?: number;
  orden?: string;
  dir?: string;
  pagina: number;
}

export interface LineaSolicitud {
  isbn: string;
  numEjemplares: number;
  costoUnitario: number;
}

const COLUMNAS_ORDEN = {
  folio: 's.id_solicitud',
  fecha: 's.fecha',
  titulos: 's.num_libros_diferentes',
  ejemplares: 's.num_ejemplares_totales',
  total: 's.total',
  estado: 's.estado',
};

const SELECT_SOLICITUD = `
  SELECT s.id_solicitud AS idSolicitud, s.matricula, s.fecha, s.estado,
         s.num_libros_diferentes AS numLibrosDiferentes, s.num_ejemplares_totales AS numEjemplaresTotales, s.total
    FROM solicitud_compra s`;

export const SolicitudModel = {
  async listar(filtros: FiltrosSolicitud): Promise<Pagina<SolicitudResumen>> {
    const condiciones: string[] = [];
    const valores: unknown[] = [];
    if (filtros.folio) {
      condiciones.push('s.id_solicitud = ?');
      valores.push(filtros.folio);
    }
    if (filtros.fechaDesde) {
      condiciones.push('s.fecha >= ?');
      valores.push(filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      condiciones.push('s.fecha <= ?');
      valores.push(filtros.fechaHasta);
    }
    if (filtros.estado) {
      condiciones.push('s.estado = ?');
      valores.push(filtros.estado);
    }
    if (filtros.costoMin !== undefined) {
      condiciones.push('s.total >= ?');
      valores.push(filtros.costoMin);
    }
    if (filtros.costoMax !== undefined) {
      condiciones.push('s.total <= ?');
      valores.push(filtros.costoMax);
    }
    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const orden = columnaOrden(filtros.orden, COLUMNAS_ORDEN, 'folio');
    const dir = filtros.dir ? direccionOrden(filtros.dir) : 'DESC';

    const [filas] = await pool.query<RowDataPacket[]>(
      `${SELECT_SOLICITUD} ${where} ORDER BY ${orden} ${dir} LIMIT ? OFFSET ?`,
      [...valores, TAMANO_PAGINA, calcularOffset(filtros.pagina)],
    );
    const [conteo] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM solicitud_compra s ${where}`,
      valores,
    );
    return {
      datos: filas as SolicitudResumen[],
      total: conteo[0].total,
      pagina: filtros.pagina,
      tamanoPagina: TAMANO_PAGINA,
    };
  },

  async buscarPorId(idSolicitud: number): Promise<Solicitud | null> {
    const [filas] = await pool.query<RowDataPacket[]>(`${SELECT_SOLICITUD} WHERE s.id_solicitud = ?`, [
      idSolicitud,
    ]);
    if (!filas[0]) return null;
    const [detalles] = await pool.query<RowDataPacket[]>(
      `SELECT d.id_detalle_solicitud AS idDetalleSolicitud, d.isbn, l.titulo,
              (SELECT GROUP_CONCAT(a.nombre ORDER BY a.nombre SEPARATOR ', ')
                 FROM libro_autor la JOIN autor a ON a.id_autor = la.id_autor WHERE la.isbn = d.isbn) AS autores,
              d.num_ejemplares AS numEjemplares, d.costo_unitario AS costoUnitario, d.subtotal
         FROM detalle_solicitud d JOIN libro l ON l.isbn = d.isbn
        WHERE d.id_solicitud = ? ORDER BY d.id_detalle_solicitud`,
      [idSolicitud],
    );
    return { ...(filas[0] as SolicitudResumen), detalles: detalles as DetalleSolicitud[] };
  },

  /** Inserta la solicitud y sus líneas usando la transacción recibida. Los totales los calcula un trigger. */
  async crear(conexion: PoolConnection, matricula: string, lineas: LineaSolicitud[]): Promise<number> {
    const [resultado] = await conexion.execute<ResultSetHeader>(
      `INSERT INTO solicitud_compra (matricula, fecha, estado) VALUES (?, CURDATE(), 'Enviado a tesorería')`,
      [matricula],
    );
    for (const linea of lineas) {
      await conexion.execute(
        'INSERT INTO detalle_solicitud (id_solicitud, isbn, num_ejemplares, costo_unitario) VALUES (?, ?, ?, ?)',
        [resultado.insertId, linea.isbn, linea.numEjemplares, linea.costoUnitario],
      );
    }
    return resultado.insertId;
  },

  async cambiarEstado(idSolicitud: number, estado: EstadoSolicitud): Promise<void> {
    await pool.execute('UPDATE solicitud_compra SET estado = ? WHERE id_solicitud = ?', [
      estado,
      idSolicitud,
    ]);
  },
};
