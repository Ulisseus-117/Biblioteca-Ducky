/**
 * Cliente HTTP único hacia la API. Agrega el token de sesión y convierte
 * las respuestas de error { error: { mensaje, codigo } } en ApiError.
 */
const URL_BASE = import.meta.env.VITE_API_URL ?? '/api';
const CLAVE_TOKEN = 'ducky.token';

export class ApiError extends Error {
  readonly status: number;
  readonly codigo?: string;

  constructor(status: number, mensaje: string, codigo?: string) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
  }
}

export const sesionStorage = {
  obtenerToken: (): string | null => localStorage.getItem(CLAVE_TOKEN),
  guardarToken: (token: string): void => localStorage.setItem(CLAVE_TOKEN, token),
  borrarToken: (): void => localStorage.removeItem(CLAVE_TOKEN),
};

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

let alExpirarSesion: () => void = () => undefined;
export function registrarExpiracionSesion(callback: () => void): void {
  alExpirarSesion = callback;
}

async function solicitar<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  const token = sesionStorage.obtenerToken();
  const respuesta = await fetch(`${URL_BASE}${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });

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
  put: <T>(ruta: string, cuerpo?: unknown) => solicitar<T>('PUT', ruta, cuerpo),
  patch: <T>(ruta: string, cuerpo?: unknown) => solicitar<T>('PATCH', ruta, cuerpo),
  delete: <T>(ruta: string) => solicitar<T>('DELETE', ruta),
};
