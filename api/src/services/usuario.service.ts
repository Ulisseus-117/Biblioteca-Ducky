import bcrypt from 'bcryptjs';
import { RolModel } from '../models/rol.model';
import { FiltrosUsuario, Usuario, UsuarioModel } from '../models/usuario.model';
import { HttpError } from '../utils/http-error';
import type { Pagina } from '../utils/pagination';

const ROL_ADMINISTRADOR = 'Administrador';
const RONDAS_HASH = 10;

async function obtenerUsuario(matricula: string): Promise<Usuario> {
  const usuario = await UsuarioModel.buscarPorMatricula(matricula);
  if (!usuario) throw HttpError.notFound('No se encontró un usuario con esa matrícula o nómina');
  return usuario;
}

async function validarRol(idRol: number): Promise<void> {
  if (!(await RolModel.buscarPorId(idRol))) throw HttpError.badRequest('El rol seleccionado no existe');
}

/** Impide dejar el sistema sin ningún administrador activo. */
async function protegerUltimoAdministrador(usuario: Usuario): Promise<void> {
  if (
    usuario.rol === ROL_ADMINISTRADOR &&
    usuario.activo &&
    (await UsuarioModel.contarAdministradoresActivos()) <= 1
  ) {
    throw HttpError.conflict(
      'Es el último administrador activo. Asigna otro administrador antes de cambiar su rol o desactivarlo.',
      'ULTIMO_ADMINISTRADOR',
    );
  }
}

export const UsuarioService = {
  listar(filtros: FiltrosUsuario): Promise<Pagina<Usuario>> {
    return UsuarioModel.listar(filtros);
  },

  obtener: obtenerUsuario,

  async crear(matricula: string, contrasena: string, idRol: number): Promise<Usuario> {
    if (await UsuarioModel.buscarPorMatricula(matricula)) {
      throw HttpError.conflict('Ya existe un usuario con esa matrícula o nómina', 'USUARIO_EXISTE');
    }
    await validarRol(idRol);
    await UsuarioModel.crear(matricula, await bcrypt.hash(contrasena, RONDAS_HASH), idRol);
    return obtenerUsuario(matricula);
  },

  async actualizar(matricula: string, cambios: { idRol?: number; contrasena?: string }): Promise<Usuario> {
    const usuario = await obtenerUsuario(matricula);
    if (cambios.idRol !== undefined && cambios.idRol !== usuario.idRol) {
      await validarRol(cambios.idRol);
      await protegerUltimoAdministrador(usuario);
    }
    await UsuarioModel.actualizar(matricula, {
      idRol: cambios.idRol,
      hashContrasena: cambios.contrasena ? await bcrypt.hash(cambios.contrasena, RONDAS_HASH) : undefined,
    });
    return obtenerUsuario(matricula);
  },

  /** Baja lógica: el usuario se desactiva, nunca se borra (conserva su historial). */
  async desactivar(matricula: string, matriculaSesion: string): Promise<Usuario> {
    const usuario = await obtenerUsuario(matricula);
    if (!usuario.activo) throw HttpError.conflict('El usuario ya está inactivo');
    if (matricula === matriculaSesion) throw HttpError.conflict('No puedes desactivar tu propia cuenta');
    await protegerUltimoAdministrador(usuario);

    if ((await UsuarioModel.contarMultasSinPagar(matricula)) > 0) {
      throw HttpError.conflict(
        'El usuario tiene multas pendientes y no puede ser desactivado.',
        'TIENE_MULTAS',
      );
    }
    if ((await UsuarioModel.contarPrestamosActivos(matricula)) > 0) {
      throw HttpError.conflict(
        'El usuario tiene préstamos activos y no puede ser desactivado.',
        'TIENE_PRESTAMOS',
      );
    }
    await UsuarioModel.cambiarActivo(matricula, false);
    return obtenerUsuario(matricula);
  },

  async reactivar(matricula: string): Promise<Usuario> {
    const usuario = await obtenerUsuario(matricula);
    if (usuario.activo) throw HttpError.conflict('El usuario ya está activo');
    await UsuarioModel.cambiarActivo(matricula, true);
    return obtenerUsuario(matricula);
  },
};
