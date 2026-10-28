import { CatalogoModel } from '../models/catalogo.model';
import { DatosLibro, FiltrosLibro, Libro, LibroModel, LibroResumen } from '../models/libro.model';
import { HttpError } from '../utils/http-error';
import type { Pagina } from '../utils/pagination';

async function obtenerLibro(isbn: string): Promise<Libro> {
  const libro = await LibroModel.buscarPorIsbn(isbn);
  if (!libro) throw HttpError.notFound('No se encontró un libro con ese ISBN');
  return libro;
}

async function validarTemasYAutores(datos: DatosLibro): Promise<void> {
  const autores = new Set((await CatalogoModel.listarAutores()).map((a) => a.idAutor));
  const temas = new Set((await CatalogoModel.listarTemas()).map((t) => t.idTema));
  if (datos.idAutores.some((id) => !autores.has(id)))
    throw HttpError.badRequest('Alguno de los autores no existe');
  if (datos.idTemas.some((id) => !temas.has(id))) throw HttpError.badRequest('Alguno de los temas no existe');
}

export const LibroService = {
  listar(filtros: FiltrosLibro): Promise<Pagina<LibroResumen>> {
    return LibroModel.listar(filtros);
  },

  listarOpciones: LibroModel.listarOpciones,

  obtener: obtenerLibro,

  async crear(datos: DatosLibro): Promise<Libro> {
    if (await LibroModel.existe(datos.isbn)) {
      throw HttpError.conflict('Ya existe un libro registrado con ese ISBN', 'ISBN_DUPLICADO');
    }
    await validarTemasYAutores(datos);
    await LibroModel.crear(datos);
    return obtenerLibro(datos.isbn);
  },

  async actualizar(isbnActual: string, datos: DatosLibro): Promise<Libro> {
    await obtenerLibro(isbnActual);
    if (datos.isbn !== isbnActual && (await LibroModel.existe(datos.isbn))) {
      throw HttpError.conflict('Ya existe otro libro registrado con ese ISBN', 'ISBN_DUPLICADO');
    }
    await validarTemasYAutores(datos);
    await LibroModel.actualizar(isbnActual, datos);
    return obtenerLibro(datos.isbn);
  },

  /**
   * Elimina la ficha del libro y sus existencias.
   * Se rechaza si hay ejemplares prestados o reservados, o si el libro ya tiene historial
   * (préstamos, reservas o solicitudes de compra) que debe conservarse.
   */
  async eliminar(isbn: string): Promise<void> {
    await obtenerLibro(isbn);
    if ((await LibroModel.contarEjemplaresOcupados(isbn)) > 0) {
      throw HttpError.conflict(
        'El libro tiene ejemplares prestados o reservados. Espera su devolución para darlo de baja.',
        'EJEMPLARES_OCUPADOS',
      );
    }
    if ((await LibroModel.contarHistorial(isbn)) > 0) {
      throw HttpError.conflict(
        'El libro tiene historial de préstamos, reservas o solicitudes de compra y no puede eliminarse. Da de baja sus ejemplares en su lugar.',
        'LIBRO_CON_HISTORIAL',
      );
    }
    await LibroModel.eliminarConEjemplares(isbn);
  },
};
