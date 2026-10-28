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

export interface Rol {
  idRol: number;
  nombre: string;
  descripcion: string | null;
}

export interface Usuario {
  matricula: string;
  idRol: number;
  rol: string;
  activo: boolean;
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

export interface DatosLibro {
  isbn: string;
  titulo: string;
  editorial: string | null;
  anio: number | null;
  idioma: string | null;
  precioUltimaCompraUsd: number | null;
  idAutores: number[];
  idTemas: number[];
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
}

export interface PaginaEjemplares extends Pagina<Ejemplar> {
  existencias: number;
  disponibles: number;
}

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

export interface LineaSolicitud {
  isbn: string;
  numEjemplares: number;
  costoUnitario: number;
  libroNuevo?: { titulo: string; autor: string };
}
