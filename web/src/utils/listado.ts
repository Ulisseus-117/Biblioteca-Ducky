import type { FiltrosLibros } from '../services/libros.service';
import type { Tema } from '../types/modelos';

/** "06/10/2026" */
export const fechaDeHoy = (): string =>
  new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

/** Línea de criterio del PDF: "Criterio de búsqueda: Tema = "X" · Fecha: dd/mm/aaaa · Resultados: N libros". */
export function textoCriterio(filtros: FiltrosLibros, temas: Tema[], fecha: string, total: number): string {
  const condiciones = [
    filtros.titulo && `Título = "${filtros.titulo}"`,
    filtros.autor && `Autor = "${filtros.autor}"`,
    filtros.idTema !== '' &&
      filtros.idTema !== undefined &&
      `Tema = "${temas.find((t) => t.idTema === filtros.idTema)?.nombre ?? ''}"`,
    filtros.isbn && `ISBN = "${filtros.isbn}"`,
    filtros.editorial && `Editorial = "${filtros.editorial}"`,
    filtros.anio !== '' && filtros.anio !== undefined && `Año = ${filtros.anio}`,
    filtros.ejemplaresMin !== '' &&
      filtros.ejemplaresMin !== undefined &&
      `Ejemplares desde ${filtros.ejemplaresMin}`,
    filtros.ejemplaresMax !== '' &&
      filtros.ejemplaresMax !== undefined &&
      `Ejemplares hasta ${filtros.ejemplaresMax}`,
  ].filter(Boolean);
  return [
    `Criterio de búsqueda: ${condiciones.length ? condiciones.join(', ') : 'todos los libros'}`,
    `Fecha: ${fecha}`,
    `Resultados: ${total} ${total === 1 ? 'libro' : 'libros'}`,
  ].join(' · ');
}
