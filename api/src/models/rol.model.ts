import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/database';

export interface Rol {
  idRol: number;
  nombre: string;
  descripcion: string | null;
}

export interface Permiso {
  idPermiso: number;
  nombre: string;
  descripcion: string | null;
}

/** Rol con los ids de sus permisos y cuántos usuarios lo tienen asignado. */
export interface PerfilConPermisos extends Rol {
  permisos: number[];
  totalUsuarios: number;
}

const SELECT_PERFIL = `
  SELECT r.id_rol AS idRol, r.nombre, r.descripcion,
         (SELECT COUNT(*) FROM usuario u WHERE u.id_rol = r.id_rol) AS totalUsuarios,
         (SELECT GROUP_CONCAT(rp.id_permiso ORDER BY rp.id_permiso)
            FROM rol_permiso rp WHERE rp.id_rol = r.id_rol) AS permisos
    FROM rol r`;

function aPerfil(fila: RowDataPacket): PerfilConPermisos {
  return {
    idRol: fila.idRol,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    totalUsuarios: Number(fila.totalUsuarios),
    permisos: fila.permisos ? String(fila.permisos).split(',').map(Number) : [],
  };
}

export const RolModel = {
  async listar(): Promise<Rol[]> {
    const [filas] = await pool.query<RowDataPacket[]>(
      'SELECT id_rol AS idRol, nombre, descripcion FROM rol ORDER BY id_rol',
    );
    return filas as Rol[];
  },

  async buscarPorId(idRol: number): Promise<Rol | null> {
    const [filas] = await pool.query<RowDataPacket[]>(
      'SELECT id_rol AS idRol, nombre, descripcion FROM rol WHERE id_rol = ?',
      [idRol],
    );
    return (filas[0] as Rol) ?? null;
  },

  async permisosDeRol(idRol: number): Promise<string[]> {
    const [filas] = await pool.query<RowDataPacket[]>(
      `SELECT p.nombre_permiso AS nombre
         FROM rol_permiso rp
         JOIN permiso p ON p.id_permiso = rp.id_permiso
        WHERE rp.id_rol = ?`,
      [idRol],
    );
    return filas.map((f) => f.nombre as string);
  },

  async buscarPorNombre(nombre: string): Promise<Rol | null> {
    const [filas] = await pool.query<RowDataPacket[]>(
      'SELECT id_rol AS idRol, nombre, descripcion FROM rol WHERE nombre = ?',
      [nombre],
    );
    return (filas[0] as Rol) ?? null;
  },

  async listarPermisos(): Promise<Permiso[]> {
    const [filas] = await pool.query<RowDataPacket[]>(
      `SELECT id_permiso AS idPermiso, nombre_permiso AS nombre, descripcion_permiso AS descripcion
         FROM permiso ORDER BY id_permiso`,
    );
    return filas as Permiso[];
  },

  async listarConPermisos(): Promise<PerfilConPermisos[]> {
    const [filas] = await pool.query<RowDataPacket[]>(`${SELECT_PERFIL} ORDER BY r.id_rol`);
    return filas.map(aPerfil);
  },

  async buscarConPermisos(idRol: number): Promise<PerfilConPermisos | null> {
    const [filas] = await pool.query<RowDataPacket[]>(`${SELECT_PERFIL} WHERE r.id_rol = ?`, [idRol]);
    return filas[0] ? aPerfil(filas[0]) : null;
  },

  /** Crea el rol y le asigna sus permisos en una sola transacción. Devuelve el id generado. */
  async crear(nombre: string, descripcion: string | null, permisos: number[]): Promise<number> {
    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();
      const [resultado] = await conexion.execute<ResultSetHeader>(
        'INSERT INTO rol (nombre, descripcion) VALUES (?, ?)',
        [nombre, descripcion],
      );
      for (const idPermiso of permisos) {
        await conexion.execute('INSERT INTO rol_permiso (id_rol, id_permiso) VALUES (?, ?)', [
          resultado.insertId,
          idPermiso,
        ]);
      }
      await conexion.commit();
      return resultado.insertId;
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  },

  /** Sustituye todos los permisos del rol por los indicados. */
  async reemplazarPermisos(idRol: number, permisos: number[]): Promise<void> {
    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();
      await conexion.execute('DELETE FROM rol_permiso WHERE id_rol = ?', [idRol]);
      for (const idPermiso of permisos) {
        await conexion.execute('INSERT INTO rol_permiso (id_rol, id_permiso) VALUES (?, ?)', [
          idRol,
          idPermiso,
        ]);
      }
      await conexion.commit();
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  },
};
