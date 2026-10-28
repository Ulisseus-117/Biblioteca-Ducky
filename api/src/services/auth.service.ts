import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { RolModel } from '../models/rol.model';
import { UsuarioModel, UsuarioSesion } from '../models/usuario.model';
import { HttpError } from '../utils/http-error';

/** Máximo de intentos fallidos antes del bloqueo temporal (pantalla 04 del prototipo). */
const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 5;

interface RegistroIntentos {
  fallidos: number;
  bloqueadoHasta?: number;
}

// En memoria: suficiente para un servidor local. En producción se movería a la BD o a Redis.
const intentosPorMatricula = new Map<string, RegistroIntentos>();

function verificarBloqueo(matricula: string): void {
  const registro = intentosPorMatricula.get(matricula);
  if (registro?.bloqueadoHasta && registro.bloqueadoHasta > Date.now()) {
    throw new HttpError(
      429,
      `Superaste el máximo de intentos fallidos (${MAX_INTENTOS}). El acceso está bloqueado temporalmente: espera unos minutos o acude con el administrador.`,
      'BLOQUEO_TEMPORAL',
    );
  }
}

function registrarFallo(matricula: string): void {
  const registro = intentosPorMatricula.get(matricula) ?? { fallidos: 0 };
  registro.fallidos += 1;
  if (registro.fallidos >= MAX_INTENTOS) {
    registro.bloqueadoHasta = Date.now() + MINUTOS_BLOQUEO * 60_000;
    registro.fallidos = 0;
  }
  intentosPorMatricula.set(matricula, registro);
}

export const AuthService = {
  async iniciarSesion(
    matricula: string,
    contrasena: string,
  ): Promise<{ token: string; usuario: UsuarioSesion }> {
    verificarBloqueo(matricula);

    const usuario = await UsuarioModel.buscarConContrasena(matricula);
    const contrasenaValida = usuario ? await bcrypt.compare(contrasena, usuario.contrasena) : false;
    if (!usuario || !contrasenaValida || !usuario.activo) {
      registrarFallo(matricula);
      verificarBloqueo(matricula);
      throw HttpError.unauthorized('Usuario o contraseña incorrectos');
    }
    intentosPorMatricula.delete(matricula);

    const sesion: UsuarioSesion = {
      matricula: usuario.matricula,
      idRol: usuario.idRol,
      rol: usuario.rol,
      permisos: await RolModel.permisosDeRol(usuario.idRol),
    };
    const token = jwt.sign(sesion, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'],
    });
    return { token, usuario: sesion };
  },
};
