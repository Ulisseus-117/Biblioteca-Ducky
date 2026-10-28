import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import { calcularOffset, columnaOrden, direccionOrden, Pagina, TAMANO_PAGINA } from '../utils/pagination';

export interface Usuario {
  matricula: string;
  idRol: number;
  rol: string;
  activo: boolean;
}

/** Datos del usuario autenticado que viajan en el token. */
export interface UsuarioSesion {
  matricula: string;
  idRol: number;
  rol: string;
  permisos: string[];
}

export interface FiltrosUsuario {
  matricula?: string;
  idRol?: number;
  activo?: boolean;
  orden?: string;
  dir?: string;
  pagina: number;
}

const COLUMNAS_ORDEN = { matricula: 'u.matricula', rol: 'r.nombre', estatus: 'u.activo' };

const SELECT_USUARIO = `
  SELECT u.matricula, u.id_rol AS idRol, r.nombre AS rol, u.activo = 1 AS activo
    FROM usuario u
    JOIN rol r ON r.id_rol = u.id_rol`;

function aUsuario(fila: RowDataPacket): Usuario {
  return { matricula: fila.matricula, idRol: fila.idRol, rol: fila.rol, activo: Boolean(fila.activo) };
}

export const UsuarioModel = {
  async listar(filtros: FiltrosUsuario): Promise<Pagina<Usuario>> {
    const condiciones: string[] = [];
    const valores: unknown[] = [];
    if (filtros.matricula) {
      condiciones.push('u.matricula LIKE ?');
      valores.push(`%${filtros.matricula}%`);
    }
    if (filtros.idRol) {
      condiciones.push('u.id_rol = ?');
      valores.push(filtros.idRol);
    }
    if (filtros.activo !== undefined) {
      condiciones.push('u.activo = ?');
      valores.push(filtros.activo);
    }
    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const orden = columnaOrden(filtros.orden, COLUMNAS_ORDEN, 'matricula');

    const [filas] = await pool.query<RowDataPacket[]>(
      `${SELECT_USUARIO} ${where} ORDER BY ${orden} ${direccionOrden(filtros.dir)}, u.matricula LIMIT ? OFFSET ?`,
      [...valores, TAMANO_PAGINA, calcularOffset(filtros.pagina)],
    );
    const [conteo] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM usuario u ${where}`,
      valores,
    );
    return {
      datos: filas.map(aUsuario),
      total: conteo[0].total,
      pagina: filtros.pagina,
      tamanoPagina: TAMANO_PAGINA,
    };
  },

  async buscarPorMatricula(matricula: string): Promise<Usuario | null> {
    const [filas] = await pool.query<RowDataPacket[]>(`${SELECT_USUARIO} WHERE u.matricula = ?`, [matricula]);
    return filas[0] ? aUsuario(filas[0]) : null;
  },

  /** Solo para autenticación: incluye el hash de la contraseña. */
  async buscarConContrasena(matricula: string): Promise<(Usuario & { contrasena: string }) | null> {
    const [filas] = await pool.query<RowDataPacket[]>(
      `SELECT u.matricula, u.contrasena, u.id_rol AS idRol, r.nombre AS rol, u.activo = 1 AS activo
         FROM usuario u JOIN rol r ON r.id_rol = u.id_rol
        WHERE u.matricula = ?`,
      [matricula],
    );
    return filas[0] ? { ...aUsuario(filas[0]), contrasena: filas[0].contrasena } : null;
  },

  async crear(matricula: string, hashContrasena: string, idRol: number): Promise<void> {
    await pool.execute('INSERT INTO usuario (matricula, contrasena, id_rol, activo) VALUES (?, ?, ?, TRUE)', [
      matricula,
      hashContrasena,
      idRol,
    ]);
  },

  async actualizar(matricula: string, cambios: { idRol?: number; hashContrasena?: string }): Promise<void> {
    const sets: string[] = [];
    const valores: (string | number)[] = [];
    if (cambios.idRol !== undefined) {
      sets.push('id_rol = ?');
      valores.push(cambios.idRol);
    }
    if (cambios.hashContrasena) {
      sets.push('contrasena = ?');
      valores.push(cambios.hashContrasena);
    }
    if (!sets.length) return;
    await pool.execute<ResultSetHeader>(`UPDATE usuario SET ${sets.join(', ')} WHERE matricula = ?`, [
      ...valores,
      matricula,
    ]);
  },

  async cambiarActivo(matricula: string, activo: boolean): Promise<void> {
    await pool.execute('UPDATE usuario SET activo = ? WHERE matricula = ?', [activo, matricula]);
  },

  async contarAdministradoresActivos(): Promise<number> {
    const [filas] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM usuario u JOIN rol r ON r.id_rol = u.id_rol
        WHERE r.nombre = 'Administrador' AND u.activo = TRUE`,
    );
    return filas[0].total;
  },

  async contarMultasSinPagar(matricula: string): Promise<number> {
    const [filas] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM multa m JOIN prestamo p ON p.id_prestamo = m.id_prestamo
        WHERE p.matricula = ? AND m.pagada = FALSE`,
      [matricula],
    );
    return filas[0].total;
  },

  async contarPrestamosActivos(matricula: string): Promise<number> {
    const [filas] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM prestamo WHERE matricula = ? AND fecha_devolucion_real IS NULL',
      [matricula],
    );
    return filas[0].total;
  },
};
