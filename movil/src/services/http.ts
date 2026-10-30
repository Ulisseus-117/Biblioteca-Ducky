/**
 * Cliente HTTP único hacia la API. Agrega el token de sesión y convierte
 * las respuestas de error { error: { mensaje, codigo } } en ApiError.
 */
import { URL_API } from '../config/servidor';
import { almacenamiento } from './almacenamiento';

export class ApiError extends Error {
  readonly status: number;
  readonly codigo?: string;

  constructor(status: number, mensaje: string, codigo?: string) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
  }
}

let token: string | null = null;
let alExpirarSesion: () => void = () => undefined;

/** Lee del dispositivo el token guardado. Se llama una vez al abrir la app. */
export async function inicializarHttp(): Promise<void> {
  token = await almacenamiento.obtenerToken();
}

export const sesionHttp = {
  hayToken: (): boolean => token !== null,
  async guardarToken(nuevo: string): Promise<void> {
    token = nuevo;
    await almacenamiento.guardarToken(nuevo);
  },
  async borrarToken(): Promise<void> {
    token = null;
    await almacenamiento.borrarToken();
  },
};

export function registrarExpiracionSesion(callback: () => void): void {
  alExpirarSesion = callback;
}

type Parametros = Record<string, string | number | boolean | undefined | null>;

/** Arma la query string omitiendo valores vacíos. */
export function aQueryString(parametros: Parametros): string {
  const busqueda = new URLSearchParams();
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') busqueda.set(clave, String(valor));
  });
  const texto = busqueda.toString();
  return texto ? `?${texto}` : '';
}

async function solicitar<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ApiError(0, `No se pudo conectar con el servidor (${URL_API})`, 'SIN_CONEXION');
  }

  if (respuesta.status === 204) return undefined as T;
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    const error = new ApiError(
      respuesta.status,
      datos?.error?.mensaje ?? 'No se pudo completar la operación',
      datos?.error?.codigo,
    );
    if (error.codigo === 'SESION_EXPIRADA') alExpirarSesion();
    throw error;
  }
  return datos as T;
}

export const http = {
  get: <T>(ruta: string) => solicitar<T>('GET', ruta),
  post: <T>(ruta: string, cuerpo?: unknown) => solicitar<T>('POST', ruta, cuerpo),
};

export function mensajeDeError(error: unknown): string {
  return error instanceof ApiError ? error.message : 'No se pudo conectar con el servidor';
}
