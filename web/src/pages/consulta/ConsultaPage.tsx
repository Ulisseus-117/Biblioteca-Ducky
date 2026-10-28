import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { CampoSeleccion, CampoTexto } from '../../components/ui/Campo';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';
import { Insignia } from '../../components/ui/Insignia';
import { Paginacion } from '../../components/ui/Paginacion';
import { Tabla, type Columna } from '../../components/ui/Tabla';
import { useConsulta, useOrden } from '../../hooks/useConsulta';
import { catalogosService } from '../../services/catalogos.service';
import { librosService, type FiltrosLibros } from '../../services/libros.service';
import type { LibroResumen } from '../../types/modelos';
import { numeroOVacio } from '../../utils/formato';

const FILTROS_INICIALES: FiltrosLibros = {
  titulo: '',
  autor: '',
  idTema: '',
  isbn: '',
  editorial: '',
  anio: '',
  ejemplaresMin: '',
  ejemplaresMax: '',
};

/** Consulta de libros para todos los roles: búsqueda por título, autor, tema, ISBN, editorial o año. */
export function ConsultaPage() {
  const navegar = useNavigate();
  const [borrador, setBorrador] = useState(FILTROS_INICIALES);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(1);
  const { orden, dir, alternar } = useOrden('titulo');
  const temas = useConsulta(() => catalogosService.temas(), []);
  const { datos, cargando, error } = useConsulta(
    () => librosService.listar({ ...filtros, orden, dir, pagina }),
    [filtros, orden, dir, pagina],
  );

  const columnas: Columna<LibroResumen>[] = [
    { clave: 'titulo', titulo: 'Título', ordenable: true, render: (l) => l.titulo },
    { clave: 'autor', titulo: 'Autor(es)', ordenable: true, render: (l) => l.autores.join(', ') },
    { clave: 'isbn', titulo: 'ISBN', ordenable: true, render: (l) => l.isbn },
    {
      clave: 'tema',
      titulo: 'Tema(s)',
      ordenable: true,
      render: (l) => (
        <div className="badges">
          {l.temas.map((t) => (
            <Insignia key={t} color="ambar">
              {t}
            </Insignia>
          ))}
        </div>
      ),
    },
    {
      clave: 'ejemplares',
      titulo: 'Ejemplares',
      ordenable: true,
      render: (l) => `${l.disponibles} de ${l.numEjemplares}`,
    },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      render: (l) => (
        <Boton chico onClick={() => navegar(`/consulta/${encodeURIComponent(l.isbn)}`)}>
          Ver detalles
        </Boton>
      ),
    },
  ];

  const texto = (campo: keyof FiltrosLibros, etiqueta: string) => (
    <CampoTexto
      etiqueta={etiqueta}
      value={(borrador[campo] as string) ?? ''}
      onChange={(e) => setBorrador({ ...borrador, [campo]: e.target.value })}
    />
  );

  return (
    <Pantalla migas={[{ texto: 'Consulta de libros', ruta: '/consulta' }, { texto: 'Resultados' }]}>
      <EncabezadoPagina
        titulo="Consulta de libros"
        descripcion="Busca por título, autor, tema, ISBN, editorial o año. Combina filtros para afinar los resultados."
      />
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          setPagina(1);
          setFiltros(borrador);
        }}
      >
        <div className="fila" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {texto('titulo', 'Título')}
          {texto('autor', 'Autor')}
          <CampoSeleccion
            etiqueta="Tema"
            vacio="Todos los temas"
            opciones={(temas.datos ?? []).map((t) => ({ valor: t.idTema, texto: t.nombre }))}
            value={borrador.idTema}
            onChange={(e) => setBorrador({ ...borrador, idTema: numeroOVacio(e.target.value) })}
          />
          {texto('isbn', 'ISBN')}
          {texto('editorial', 'Editorial')}
          <CampoTexto
            etiqueta="Año"
            type="number"
            value={borrador.anio}
            onChange={(e) => setBorrador({ ...borrador, anio: numeroOVacio(e.target.value) })}
          />
        </div>
        <div className="fila" style={{ gridTemplateColumns: '160px 160px' }}>
          <CampoTexto
            etiqueta="Ejemplares (mín.)"
            type="number"
            min={0}
            value={borrador.ejemplaresMin}
            onChange={(e) => setBorrador({ ...borrador, ejemplaresMin: numeroOVacio(e.target.value) })}
          />
          <CampoTexto
            etiqueta="Ejemplares (máx.)"
            type="number"
            min={0}
            value={borrador.ejemplaresMax}
            onChange={(e) => setBorrador({ ...borrador, ejemplaresMax: numeroOVacio(e.target.value) })}
          />
        </div>
        <div className="acciones acciones--derecha">
          <Boton
            variante="secundario"
            onClick={() => {
              setBorrador(FILTROS_INICIALES);
              setFiltros(FILTROS_INICIALES);
              setPagina(1);
            }}
          >
            Limpiar
          </Boton>
          <Boton type="submit">Buscar</Boton>
        </div>
      </form>

      <div className="acciones">
        <h2 className="seccion-titulo" style={{ flex: 1 }}>
          Resultados ({datos?.total ?? 0} {datos?.total === 1 ? 'libro' : 'libros'})
        </h2>
        <Boton variante="secundario" onClick={() => window.print()}>
          Imprimir
        </Boton>
      </div>
      {error && <Alerta tipo="error">{error}</Alerta>}
      <Tabla
        columnas={columnas}
        filas={datos?.datos ?? []}
        clave={(l) => l.isbn}
        orden={orden}
        dir={dir}
        alOrdenar={alternar}
        cargando={cargando}
        mensajeVacio="Sin resultados. Prueba con otros filtros."
      />
      {datos && (
        <Paginacion
          pagina={datos.pagina}
          total={datos.total}
          tamanoPagina={datos.tamanoPagina}
          sustantivo={datos.total === 1 ? 'libro' : 'libros'}
          alCambiar={setPagina}
        />
      )}
    </Pantalla>
  );
}
