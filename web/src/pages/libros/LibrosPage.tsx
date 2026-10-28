import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { BotonIcono } from '../../components/ui/BotonIcono';
import { CampoSeleccion, CampoTexto } from '../../components/ui/Campo';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';
import { Insignia } from '../../components/ui/Insignia';
import { Modal } from '../../components/ui/Modal';
import { Paginacion } from '../../components/ui/Paginacion';
import { Tabla, type Columna } from '../../components/ui/Tabla';
import { mensajeDeError, useConsulta, useOrden } from '../../hooks/useConsulta';
import { catalogosService } from '../../services/catalogos.service';
import { librosService, type FiltrosLibros } from '../../services/libros.service';
import type { LibroResumen } from '../../types/modelos';
import { numeroOVacio } from '../../utils/formato';

const FILTROS_INICIALES: FiltrosLibros = {
  q: '',
  idTema: '',
  editorial: '',
  anio: '',
  ejemplaresMin: '',
  ejemplaresMax: '',
};

type Dialogo =
  { tipo: 'confirmar'; libro: LibroResumen } | { tipo: 'exito' | 'rechazo'; titulo: string; mensaje: string };

export function LibrosPage() {
  const navegar = useNavigate();
  const avisoInicial = (useLocation().state as { aviso?: string } | null)?.aviso;
  const [borrador, setBorrador] = useState(FILTROS_INICIALES);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [masFiltros, setMasFiltros] = useState(false);
  const [pagina, setPagina] = useState(1);
  const { orden, dir, alternar } = useOrden('titulo');
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);

  const { datos: temas } = useConsulta(() => catalogosService.temas(), []);
  const { datos, cargando, error, recargar } = useConsulta(
    () => librosService.listar({ ...filtros, orden, dir, pagina }),
    [filtros, orden, dir, pagina],
  );

  const eliminar = async (libro: LibroResumen) => {
    try {
      await librosService.eliminar(libro.isbn);
      setDialogo({
        tipo: 'exito',
        titulo: 'Libro eliminado',
        mensaje: `"${libro.titulo}" se dio de baja del catálogo.`,
      });
      void recargar();
    } catch (e) {
      setDialogo({ tipo: 'rechazo', titulo: 'No se puede eliminar el libro', mensaje: mensajeDeError(e) });
    }
  };

  const columnas: Columna<LibroResumen>[] = [
    { clave: 'titulo', titulo: 'Título', ordenable: true, ancho: '22%', render: (l) => l.titulo },
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
    { clave: 'ejemplares', titulo: 'Ejemplares', ordenable: true, render: (l) => l.numEjemplares },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      render: (l) => (
        <div className="tabla__acciones">
          <Boton chico onClick={() => navegar(`/libros/${encodeURIComponent(l.isbn)}`)}>
            Ver detalles
          </Boton>
          <BotonIcono
            icono="lapiz"
            etiqueta={`Editar ${l.titulo}`}
            onClick={() => navegar(`/libros/${encodeURIComponent(l.isbn)}/editar`)}
          />
          <BotonIcono
            icono="basura"
            variante="peligro"
            etiqueta={`Eliminar ${l.titulo}`}
            onClick={() => setDialogo({ tipo: 'confirmar', libro: l })}
          />
        </div>
      ),
    },
  ];

  return (
    <Pantalla migas={[{ texto: 'Gestión de libros', ruta: '/libros' }, { texto: 'Consulta' }]}>
      <EncabezadoPagina
        titulo="Libros"
        descripcion="Pestaña para administrar los libros que se encuentran en el sistema."
      >
        <Link to="/libros/nuevo" className="btn btn--primario">
          Nuevo libro +
        </Link>
      </EncabezadoPagina>

      {avisoInicial && <Alerta tipo="exito">{avisoInicial}</Alerta>}

      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          setPagina(1);
          setFiltros(borrador);
        }}
      >
        <CampoTexto
          etiqueta="Buscar libro"
          placeholder="Título, autor o ISBN"
          value={borrador.q}
          onChange={(e) => setBorrador({ ...borrador, q: e.target.value })}
        />
        {masFiltros && (
          <div className="fila">
            <CampoSeleccion
              etiqueta="Tema"
              vacio="Todos los temas"
              opciones={(temas ?? []).map((t) => ({ valor: t.idTema, texto: t.nombre }))}
              value={borrador.idTema}
              onChange={(e) => setBorrador({ ...borrador, idTema: numeroOVacio(e.target.value) })}
            />
            <CampoTexto
              etiqueta="Editorial"
              value={borrador.editorial}
              onChange={(e) => setBorrador({ ...borrador, editorial: e.target.value })}
            />
            <CampoTexto
              etiqueta="Año"
              type="number"
              value={borrador.anio}
              onChange={(e) => setBorrador({ ...borrador, anio: numeroOVacio(e.target.value) })}
            />
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
        )}
        <div className="acciones">
          <Boton variante="secundario" onClick={() => setMasFiltros(!masFiltros)}>
            {masFiltros ? 'Menos filtros' : 'Más filtros'}
          </Boton>
          <span style={{ flex: 1 }} />
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

      {error && <Alerta tipo="error">{error}</Alerta>}
      <Tabla
        columnas={columnas}
        filas={datos?.datos ?? []}
        clave={(l) => l.isbn}
        orden={orden}
        dir={dir}
        alOrdenar={alternar}
        cargando={cargando}
        mensajeVacio="No se encontró ningún libro con esos datos."
      />
      {datos && (
        <Paginacion
          pagina={datos.pagina}
          total={datos.total}
          tamanoPagina={datos.tamanoPagina}
          sustantivo="libros"
          alCambiar={setPagina}
        />
      )}

      {dialogo?.tipo === 'confirmar' && (
        <Modal
          titulo="¿Eliminar libro?"
          icono="basura"
          acciones={
            <>
              <Boton variante="secundario" onClick={() => setDialogo(null)}>
                Cancelar
              </Boton>
              <Boton variante="peligro" onClick={() => eliminar(dialogo.libro)}>
                Eliminar libro
              </Boton>
            </>
          }
        >
          Se eliminará "{dialogo.libro.titulo}" ({dialogo.libro.isbn}) del catálogo junto con sus{' '}
          {dialogo.libro.numEjemplares} ejemplares.
        </Modal>
      )}
      {(dialogo?.tipo === 'exito' || dialogo?.tipo === 'rechazo') && (
        <Modal
          titulo={dialogo.titulo}
          icono={dialogo.tipo === 'exito' ? 'check' : 'alerta'}
          tono={dialogo.tipo === 'exito' ? 'exito' : 'peligro'}
          acciones={<Boton onClick={() => setDialogo(null)}>Entendido</Boton>}
        >
          {dialogo.mensaje}
        </Modal>
      )}
    </Pantalla>
  );
}
