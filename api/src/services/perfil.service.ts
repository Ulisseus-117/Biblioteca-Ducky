import { PerfilConPermisos, Permiso, RolModel } from '../models/rol.model';
import { HttpError } from '../utils/http-error';

/** El Administrador nunca pierde la gestión de usuarios y perfiles, para no dejar el sistema sin control. */
const PERFIL_ADMINISTRADOR = 'Administrador';
const PERMISOS_FIJOS_ADMIN = ['usuarios.gestionar', 'perfiles.gestionar'];

async function obtenerPerfil(idRol: number): Promise<PerfilConPermisos> {
  const perfil = await RolModel.buscarConPermisos(idRol);
  if (!perfil) throw HttpError.notFound('No se encontró el perfil');
  return perfil;
}

/** Quita repetidos y verifica que todos los permisos existan en el catálogo. */
async function validarPermisos(permisos: number[]): Promise<number[]> {
  const unicos = [...new Set(permisos)];
  const existentes = new Set((await RolModel.listarPermisos()).map((p) => p.idPermiso));
  if (unicos.some((id) => !existentes.has(id))) {
    throw HttpError.badRequest('Uno de los permisos seleccionados no existe', 'DATOS_INVALIDOS');
  }
  return unicos;
}

export const PerfilService = {
  listar(): Promise<PerfilConPermisos[]> {
    return RolModel.listarConPermisos();
  },

  permisos(): Promise<Permiso[]> {
    return RolModel.listarPermisos();
  },

  obtener: obtenerPerfil,

  async crear(datos: {
    nombre: string;
    descripcion?: string;
    permisos: number[];
  }): Promise<PerfilConPermisos> {
    if (await RolModel.buscarPorNombre(datos.nombre)) {
      throw HttpError.conflict('Ya existe un perfil con ese nombre', 'PERFIL_EXISTE');
    }
    const permisos = await validarPermisos(datos.permisos);
    const idRol = await RolModel.crear(datos.nombre, datos.descripcion ?? null, permisos);
    return obtenerPerfil(idRol);
  },

  async actualizarPermisos(idRol: number, permisos: number[]): Promise<PerfilConPermisos> {
    const perfil = await obtenerPerfil(idRol);
    const validos = await validarPermisos(permisos);
    if (perfil.nombre === PERFIL_ADMINISTRADOR) {
      const catalogo = await RolModel.listarPermisos();
      const fijos = catalogo.filter((p) => PERMISOS_FIJOS_ADMIN.includes(p.nombre)).map((p) => p.idPermiso);
      if (fijos.some((id) => !validos.includes(id))) {
        throw HttpError.conflict(
          'Acción no permitida: la gestión de usuarios y perfiles del administrador no se puede desactivar.',
          'PERFIL_BLOQUEADO',
        );
      }
    }
    await RolModel.reemplazarPermisos(idRol, validos);
    return obtenerPerfil(idRol);
  },
};
