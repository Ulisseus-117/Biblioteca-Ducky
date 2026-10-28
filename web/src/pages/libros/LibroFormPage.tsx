import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { CampoSeleccion, CampoTexto } from '../../components/ui/Campo';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';
import { Icono } from '../../components/ui/Icono';
import { SelectorMultiple } from '../../components/ui/SelectorMultiple';
import { mensajeDeError, useConsulta } from '../../hooks/useConsulta';
import { catalogosService } from '../../services/catalogos.service';
import { librosService } from '../../services/libros.service';
import type { DatosLibro } from '../../types/modelos';

const IDIOMAS = ['Español', 'Inglés', 'Francés', 'Alemán', 'Portugués', 'Italiano', 'Otro'];

const LIBRO_VACIO: DatosLibro = {
  isbn: '',
  titulo: '',
  editorial: '',
  anio: null,
  idioma: '',
  precioUltimaCompraUsd: null,
  idAutores: [],
  idTemas: [],
};

/** Alta (/libros/nuevo) y edición (/libros/:isbn/editar) de la ficha bibliográfica. */
export function LibroFormPage() {
  const { isbn: isbnParam } = useParams();
  const esEdicion = Boolean(isbnParam);
  const navegar = useNavigate();
  const [libro, setLibro] = useState<DatosLibro>(LIBRO_VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const autores = useConsulta(() => catalogosService.autores(), []);
  const temas = useConsulta(() => catalogosService.temas(), []);

  useEffect(() => {
    if (!isbnParam) return;
    librosService
      .obtener(isbnParam)
      .then((l) =>
        setLibro({
          isbn: l.isbn,
          titulo: l.titulo,
          editorial: l.editorial ?? '',
          anio: l.anio,
          idioma: l.idioma ?? '',
          precioUltimaCompraUsd: l.precioUltimaCompraUsd,
          idAutores: l.autores.map((a) => a.idAutor),
          idTemas: l.temas.map((t) => t.idTema),
        }),
      )
      .catch((e) => setErrorGeneral(mensajeDeError(e)));
  }, [isbnParam]);

  const cambiar = <K extends keyof DatosLibro>(campo: K, valor: DatosLibro[K]) =>
    setLibro((actual) => ({ ...actual, [campo]: valor }));

  const validar = (): boolean => {
    const nuevos: Record<string, string> = {};
    if (!libro.titulo.trim()) nuevos.titulo = 'El título es obligatorio';
    if (!libro.isbn.trim()) nuevos.isbn = 'El ISBN es obligatorio';
    if (!libro.idAutores.length) nuevos.autores = 'Selecciona al menos un autor';
    setErrores(nuevos);
    if (Object.keys(nuevos).length)
      setErrorGeneral('Completa los campos obligatorios: título, autor e ISBN.');
    return Object.keys(nuevos).length === 0;
  };

  const guardar = async (evento: FormEvent) => {
    evento.preventDefault();
    setErrorGeneral(null);
    if (!validar()) return;
    setGuardando(true);
    const datos: DatosLibro = {
      ...libro,
      isbn: libro.isbn.trim(),
      titulo: libro.titulo.trim(),
      editorial: libro.editorial?.trim() || null,
      idioma: libro.idioma || null,
    };
    try {
      if (esEdicion && isbnParam) {
        await librosService.actualizar(isbnParam, datos);
        navegar('/libros', { state: { aviso: `Se actualizó "${datos.titulo}".` } });
      } else {
        await librosService.crear(datos);
        navegar('/libros', {
          state: { aviso: `Se registró "${datos.titulo}" con 0 ejemplares. Ahora registra sus ejemplares.` },
        });
      }
    } catch (e) {
      setErrorGeneral(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  };

  const titulo = esEdicion ? 'Editar libro' : 'Nuevo libro';

  return (
    <Pantalla migas={[{ texto: 'Gestión de libros', ruta: '/libros' }, { texto: titulo }]}>
      <EncabezadoPagina titulo={titulo} descripcion="Captura la ficha bibliográfica del título.">
        <Link to="/libros" className="btn btn--primario">
          <Icono nombre="flechaIzquierda" tamano={16} /> Volver
        </Link>
      </EncabezadoPagina>

      <form className="formulario" onSubmit={guardar} noValidate>
        {!esEdicion && (
          <Alerta tipo="info">
            El libro se registra con 0 ejemplares. Después usa "Registrar ejemplares" para dar de alta las
            copias físicas. Campos obligatorios: título, autor e ISBN.
          </Alerta>
        )}
        {errorGeneral && <Alerta tipo="error">{errorGeneral}</Alerta>}
        <CampoTexto
          etiqueta="Título del libro *"
          value={libro.titulo}
          error={errores.titulo}
          onChange={(e) => cambiar('titulo', e.target.value)}
        />
        <div className="fila" style={{ alignItems: 'start' }}>
          <SelectorMultiple
            etiqueta="Autor *"
            sustantivo="autor"
            opciones={(autores.datos ?? []).map((a) => ({ valor: a.idAutor, texto: a.nombre }))}
            valores={libro.idAutores}
            error={errores.autores}
            alCambiar={(ids) => cambiar('idAutores', ids)}
            alCrear={async (nombre) => {
              const autor = await catalogosService.crearAutor(nombre);
              await autores.recargar();
              return autor.idAutor;
            }}
          />
          <CampoTexto
            etiqueta="Editorial"
            value={libro.editorial ?? ''}
            onChange={(e) => cambiar('editorial', e.target.value)}
          />
        </div>
        <div className="fila">
          <CampoTexto
            etiqueta="ISBN *"
            placeholder="978-0-00-000000-0"
            value={libro.isbn}
            error={errores.isbn}
            onChange={(e) => cambiar('isbn', e.target.value)}
          />
          <CampoTexto
            etiqueta="Año de publicación"
            type="number"
            value={libro.anio ?? ''}
            onChange={(e) => cambiar('anio', e.target.value ? Number(e.target.value) : null)}
          />
          <CampoSeleccion
            etiqueta="Idioma"
            vacio="Selecciona un idioma"
            opciones={IDIOMAS.map((i) => ({ valor: i, texto: i }))}
            value={libro.idioma ?? ''}
            onChange={(e) => cambiar('idioma', e.target.value)}
          />
          <CampoTexto
            etiqueta="Precio última compra (USD)"
            type="number"
            min={0}
            step="0.01"
            value={libro.precioUltimaCompraUsd ?? ''}
            onChange={(e) => cambiar('precioUltimaCompraUsd', e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <SelectorMultiple
          etiqueta="Temas"
          sustantivo="tema"
          opciones={(temas.datos ?? []).map((t) => ({ valor: t.idTema, texto: t.nombre }))}
          valores={libro.idTemas}
          alCambiar={(ids) => cambiar('idTemas', ids)}
          alCrear={async (nombre) => {
            const tema = await catalogosService.crearTema(nombre);
            await temas.recargar();
            return tema.idTema;
          }}
        />
        <div className="acciones">
          <Boton type="submit" disabled={guardando}>
            {esEdicion ? 'Guardar cambios' : 'Registrar libro'}
          </Boton>
          <Boton variante="secundario" onClick={() => navegar('/libros')}>
            Cancelar
          </Boton>
        </div>
      </form>
    </Pantalla>
  );
}
