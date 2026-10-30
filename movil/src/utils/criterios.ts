import type { FiltrosEjemplares, OrdenEjemplares } from '../services/ejemplares.service';
import type { FiltrosLibros, OrdenLibros } from '../services/libros.service';
import type { EstadoEjemplar, Modalidad, Tema } from '../types/modelos';
import { numeroOVacio } from './formato';

/**
 * Los criterios de búsqueda viajan en la URL (?titulo=...&orden=...), así cada pantalla
 * (búsqueda, filtros, resultados, PDF) los comparte y el botón "atrás" los conserva.
 */

const ORDENES_LIBROS: OrdenLibros[] = ['titulo', 'autor', 'ejemplares'];
const ORDENES_EJEMPLARES: OrdenEjemplares[] = ['id', 'estado', 'modalidad', 'ubicacion'];

export const ETIQUETA_ORDEN_LIBROS: Record<OrdenLibros, string> = {
  titulo: 'Título',
  autor: 'Autor',
  ejemplares: 'Ejemplares',
};

export const ETIQUETA_ORDEN_EJEMPLARES: Record<OrdenEjemplares, string> = {
  id: 'ID de ejemplar',
  estado: 'Estado',
  modalidad: 'Modalidad',
  ubicacion: 'Ubicación física',
};

const texto = (p: URLSearchParams, clave: string) => p.get(clave) ?? '';
const direccion = (p: URLSearchParams): 'asc' | 'desc' => (p.get('dir') === 'desc' ? 'desc' : 'asc');

export function leerFiltrosLibros(
  busqueda: string,
): Required<Omit<FiltrosLibros, 'pagina'>> & { pagina: number } {
  const p = new URLSearchParams(busqueda);
  const orden = p.get('orden') as OrdenLibros;
  return {
    titulo: texto(p, 'titulo'),
    autor: texto(p, 'autor'),
    idTema: numeroOVacio(p.get('idTema')),
    isbn: texto(p, 'isbn'),
    editorial: texto(p, 'editorial'),
    anio: numeroOVacio(p.get('anio')),
    ejemplaresMin: numeroOVacio(p.get('ejemplaresMin')),
    ejemplaresMax: numeroOVacio(p.get('ejemplaresMax')),
    orden: ORDENES_LIBROS.includes(orden) ? orden : 'titulo',
    dir: direccion(p),
    pagina: Math.max(Number(p.get('pagina')) || 1, 1),
  };
}

export function leerFiltrosEjemplares(busqueda: string): Required<
  Omit<FiltrosEjemplares, 'isbn' | 'pagina'>
> & {
  pagina: number;
} {
  const p = new URLSearchParams(busqueda);
  const orden = p.get('orden') as OrdenEjemplares;
  return {
    idEjemplar: numeroOVacio(p.get('idEjemplar')),
    estado: (p.get('estado') ?? '') as EstadoEjemplar | '',
    modalidad: (p.get('modalidad') ?? '') as Modalidad | '',
    idUbicacion: numeroOVacio(p.get('idUbicacion')),
    orden: ORDENES_EJEMPLARES.includes(orden) ? orden : 'id',
    dir: direccion(p),
    pagina: Math.max(Number(p.get('pagina')) || 1, 1),
  };
}

/** Arma "?clave=valor&..." omitiendo valores vacíos y los valores por defecto. */
export function aBusqueda(filtros: object, porDefecto: Record<string, unknown> = {}): string {
  const p = new URLSearchParams();
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor === '' || valor === undefined || valor === null || porDefecto[clave] === valor) return;
    p.set(clave, String(valor));
  });
  const resultado = p.toString();
  return resultado ? `?${resultado}` : '';
}

export const POR_DEFECTO_LIBROS = { orden: 'titulo', dir: 'asc', pagina: 1 };
export const POR_DEFECTO_EJEMPLARES = { orden: 'id', dir: 'asc', pagina: 1 };

/**
 * Texto del recuadro "Criterios de búsqueda", como en el prototipo:
 * "Título: «la» · Autor: cualquiera · Tema: Todos · Ejemplares: 1 a 10 · Orden: Título ↓"
 */
export function textoCriterios(filtros: ReturnType<typeof leerFiltrosLibros>, temas: Tema[]): string {
  const partes = [
    `Título: ${filtros.titulo ? `«${filtros.titulo}»` : 'cualquiera'}`,
    `Autor: ${filtros.autor || 'cualquiera'}`,
    `Tema: ${filtros.idTema === '' ? 'Todos' : (temas.find((t) => t.idTema === filtros.idTema)?.nombre ?? '—')}`,
  ];
  if (filtros.isbn) partes.push(`ISBN: ${filtros.isbn}`);
  if (filtros.editorial) partes.push(`Editorial: ${filtros.editorial}`);
  if (filtros.anio !== '') partes.push(`Año: ${filtros.anio}`);
  if (filtros.ejemplaresMin !== '' || filtros.ejemplaresMax !== '') {
    partes.push(
      `Ejemplares: ${filtros.ejemplaresMin === '' ? 0 : filtros.ejemplaresMin} a ${filtros.ejemplaresMax === '' ? 'más' : filtros.ejemplaresMax}`,
    );
  }
  if (filtros.orden !== 'titulo' || filtros.dir !== 'asc') {
    partes.push(`Orden: ${ETIQUETA_ORDEN_LIBROS[filtros.orden]} ${filtros.dir === 'asc' ? '↑' : '↓'}`);
  }
  return partes.join(' · ');
}

// La ficha y los ejemplares regresan a la última lista de resultados que se vio
let ultimaBusquedaLibros = '';
export const recordarBusquedaLibros = (busqueda: string): void => {
  ultimaBusquedaLibros = busqueda;
};
export const rutaResultados = (): string => `/consulta/resultados${ultimaBusquedaLibros}`;

/** Encabezado del PDF: 'Criterio de búsqueda: Tema = "Comunismo" · Fecha: 08/10/2026 · Resultados: 2 libros'. */
export function textoCriterioPdf(
  filtros: ReturnType<typeof leerFiltrosLibros>,
  temas: Tema[],
  fecha: string,
  total: number,
): string {
  const condiciones = [
    filtros.titulo && `Título = "${filtros.titulo}"`,
    filtros.autor && `Autor = "${filtros.autor}"`,
    filtros.idTema !== '' && `Tema = "${temas.find((t) => t.idTema === filtros.idTema)?.nombre ?? ''}"`,
    filtros.isbn && `ISBN = "${filtros.isbn}"`,
    filtros.editorial && `Editorial = "${filtros.editorial}"`,
    filtros.anio !== '' && `Año = ${filtros.anio}`,
    filtros.ejemplaresMin !== '' && `Ejemplares desde ${filtros.ejemplaresMin}`,
    filtros.ejemplaresMax !== '' && `Ejemplares hasta ${filtros.ejemplaresMax}`,
  ].filter(Boolean);
  return [
    `Criterio de búsqueda: ${condiciones.length ? condiciones.join(', ') : 'todos los libros'}`,
    `Fecha: ${fecha}`,
    `Resultados: ${total} ${total === 1 ? 'libro' : 'libros'}`,
  ].join(' · ');
}
