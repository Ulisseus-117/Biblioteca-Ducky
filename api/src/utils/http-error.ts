/** Error con código HTTP que el middleware de errores convierte en respuesta JSON. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly codigo?: string,
  ) {
    super(message);
  }

  static badRequest(message: string, codigo?: string): HttpError {
    return new HttpError(400, message, codigo);
  }

  static unauthorized(message = 'Credenciales incorrectas'): HttpError {
    return new HttpError(401, message, 'NO_AUTENTICADO');
  }

  static forbidden(message = 'Acceso denegado'): HttpError {
    return new HttpError(403, message, 'ACCESO_DENEGADO');
  }

  static notFound(message: string): HttpError {
    return new HttpError(404, message, 'NO_ENCONTRADO');
  }

  static conflict(message: string, codigo?: string): HttpError {
    return new HttpError(409, message, codigo);
  }
}
