/** Tipos que reflejan las respuestas JSON de la API. */

export interface Pagina<T> {
  datos: T[];
  total: number;
  pagina: number;
  tamanoPagina: number;
}

export interface UsuarioSesion {
  matricula: string;
  idRol: number;
  rol: string;
  permisos: string[];
}

export interface Autor {
  idAutor: number;
  nombre: string;
}

export interface Tema {
  idTema: number;
  nombre: string;
}

export interface Ubicacion {
  idUbicacion: number;
  estante: number;
  seccion: number;
}

export interface LibroResumen {
  isbn: string;
  titulo: string;
  autores: string[];
  temas: string[];
  numEjemplares: number;
  disponibles: number;
}

export interface Libro {
  isbn: string;
  titulo: string;
  editorial: string | null;
  anio: number | null;
  idioma: string | null;
  precioUltimaCompraUsd: number | null;
  numEjemplares: number;
  disponibles: number;
  autores: Autor[];
  temas: Tema[];
}

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
  /** Fecha del préstamo activo ('AAAA-MM-DD'); null si el ejemplar no está prestado. */
  fechaDevolucionEsperada: string | null;
}

export interface PaginaEjemplares extends Pagina<Ejemplar> {
  existencias: number;
  disponibles: number;
}
