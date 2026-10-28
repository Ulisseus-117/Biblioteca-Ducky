import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { BotonIcono } from '../../components/ui/BotonIcono';
import { CampoSeleccion, CampoTexto } from '../../components/ui/Campo';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';
import { COLOR_ESTADO_EJEMPLAR } from '../../config/colores';
import { Insignia } from '../../components/ui/Insignia';
import { Modal } from '../../components/ui/Modal';
import { Paginacion } from '../../components/ui/Paginacion';
import { Tabla, type Columna } from '../../components/ui/Tabla';
import { mensajeDeError, useConsulta, useOrden } from '../../hooks/useConsulta';
import { catalogosService } from '../../services/catalogos.service';
import { ejemplaresService, type FiltrosEjemplares } from '../../services/ejemplares.service';
import { librosService } from '../../services/libros.service';
import { ESTADOS_EJEMPLAR, MODALIDADES, type Ejemplar } from '../../types/modelos';
import { folioEjemplar, textoUbicacion } from '../../utils/formato';

type Dialogo =
  { tipo: 'confirmar'; ejemplar: Ejemplar } | { tipo: 'exito' | 'rechazo'; titulo: string; mensaje: string };

/** Acepta "EJ-000101" o "101" en la búsqueda por ID. */
const aIdEjemplar = (texto: string): number | '' => {
  const digitos = texto.replace(/\D/g, '');
  return digitos ? Number(digitos) : '';
};

export function EjemplaresPage() {
  const navegar = useNavigate();
  const avisoInicial = (useLocation().state as { aviso?: string } | null)?.aviso;
  const [parametros] = useSearchParams();
  const inicial: FiltrosEjemplares = {
    isbn: parametros.get('isbn') ?? '',
    idEjemplar: '',
    estado: '',
    modalidad: '',
    idUbicacion: '',
  };
  const [borrador, setBorrador] = useState(inicial);
  const [textoId, setTextoId] = useState('');
  const [filtros, setFiltros] = useState(inicial);
  const [pagina, setPagina] = useState(1);
  const { orden, dir, alternar } = useOrden('id');
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);

  const libros = useConsulta(() => librosService.opciones(), []);
  const ubicaciones = useConsulta(() => catalogosService.ubicaciones(), []);
  const { datos, cargando, error, recargar } = useConsulta(
    () => ejemplaresService.listar({ ...filtros, orden, dir, pagina }),
    [filtros, orden, dir, pagina],
  );

  const libroFiltrado = libros.datos?.find((l) => l.isbn === filtros.isbn);

  const darDeBaja = async (ejemplar: Ejemplar) => {
    try {
      const { eliminado } = await ejemplaresService.darDeBaja(ejemplar.idEjemplar);
      setDialogo({
        tipo: 'exito',
        titulo: 'Existencia eliminada',
        mensaje: eliminado
          ? `${folioEjemplar(ejemplar.idEjemplar)} se retiró del inventario.`
          : `${folioEjemplar(ejemplar.idEjemplar)} tiene historial de préstamos: se conservó el registro y se marcó como fuera de servicio.`,
      });
      void recargar();
    } catch (e) {
      setDialogo({ tipo: 'rechazo', titulo: 'No se puede eliminar el ejemplar', mensaje: mensajeDeError(e) });
    }
  };

  const columnas: Columna<Ejemplar>[] = [
    { clave: 'id', titulo: 'ID de ejemplar', ordenable: true, render: (e) => folioEjemplar(e.idEjemplar) },
    ...(filtros.isbn ? [] : [{ clave: 'libro', titulo: 'Libro', render: (e: Ejemplar) => e.titulo }]),
    {
      clave: 'estado',
      titulo: 'Estado',
      ordenable: true,
      render: (e) => <Insignia color={COLOR_ESTADO_EJEMPLAR[e.estado]}>{e.estado}</Insignia>,
    },
    { clave: 'modalidad', titulo: 'Modalidad', ordenable: true, render: (e) => e.modalidad },
    { clave: 'ubicacion', titulo: 'Ubicación física', ordenable: true, render: (e) => textoUbicacion(e) },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      render: (e) => (
        <div className="tabla__acciones">
          <BotonIcono
            icono="lapiz"
            etiqueta={`Editar ${folioEjemplar(e.idEjemplar)}`}
            onClick={() => navegar(`/ejemplares/${e.idEjemplar}/editar`)}
          />
          <BotonIcono
            icono="basura"
            variante="peligro"
            etiqueta={`Eliminar ${folioEjemplar(e.idEjemplar)}`}
            onClick={() => setDialogo({ tipo: 'confirmar', ejemplar: e })}
          />
        </div>
      ),
    },
  ];

  return (
    <Pantalla migas={[{ texto: 'Ejemplares', ruta: '/ejemplares' }, { texto: 'Consulta' }]}>
      <EncabezadoPagina
        titulo="Ejemplares"
        descripcion={
          libroFiltrado
            ? `Existencias físicas de "${libroFiltrado.titulo}" · ISBN ${libroFiltrado.isbn}`
            : 'Existencias físicas de todos los libros del catálogo'
        }
      >
        <Link
          to={`/ejemplares/registrar${filtros.isbn ? `?isbn=${encodeURIComponent(filtros.isbn)}` : ''}`}
          className="btn btn--primario"
        >
          Registrar ejemplares +
        </Link>
      </EncabezadoPagina>

      {avisoInicial && <Alerta tipo="exito">{avisoInicial}</Alerta>}

      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          setPagina(1);
          setFiltros({ ...borrador, idEjemplar: aIdEjemplar(textoId) });
        }}
      >
        <div className="fila">
          <CampoSeleccion
            etiqueta="Libro"
            vacio="Todos los libros"
            opciones={(libros.datos ?? []).map((l) => ({ valor: l.isbn, texto: l.titulo }))}
            value={borrador.isbn}
            onChange={(e) => setBorrador({ ...borrador, isbn: e.target.value })}
          />
          <CampoTexto
            etiqueta="Buscar ejemplar por ID"
            placeholder="Ej. EJ-000101"
            value={textoId}
            onChange={(e) => setTextoId(e.target.value)}
          />
          <CampoSeleccion
            etiqueta="Estado"
            vacio="Todos"
            opciones={ESTADOS_EJEMPLAR.map((e) => ({ valor: e, texto: e }))}
            value={borrador.estado}
            onChange={(e) =>
              setBorrador({ ...borrador, estado: e.target.value as FiltrosEjemplares['estado'] })
            }
          />
          <CampoSeleccion
            etiqueta="Modalidad"
            vacio="Todas"
            opciones={MODALIDADES.map((m) => ({ valor: m, texto: m }))}
            value={borrador.modalidad}
            onChange={(e) =>
              setBorrador({ ...borrador, modalidad: e.target.value as FiltrosEjemplares['modalidad'] })
            }
          />
          <CampoSeleccion
            etiqueta="Ubicación física"
            vacio="Todas"
            opciones={(ubicaciones.datos ?? []).map((u) => ({
              valor: u.idUbicacion,
              texto: textoUbicacion(u),
            }))}
            value={borrador.idUbicacion}
            onChange={(e) =>
              setBorrador({ ...borrador, idUbicacion: e.target.value ? Number(e.target.value) : '' })
            }
          />
        </div>
        <div className="acciones acciones--derecha">
          <Boton
            variante="secundario"
            onClick={() => {
              const vacio = { isbn: '', idEjemplar: '', estado: '', modalidad: '', idUbicacion: '' } as const;
              setBorrador(vacio);
              setTextoId('');
              setFiltros(vacio);
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
        clave={(e) => e.idEjemplar}
        orden={orden}
        dir={dir}
        alOrdenar={alternar}
        cargando={cargando}
        mensajeVacio="No se encontró ningún ejemplar con esos datos."
      />
      {datos && (
        <>
          <Paginacion
            pagina={datos.pagina}
            total={datos.total}
            tamanoPagina={datos.tamanoPagina}
            sustantivo="ejemplares"
            alCambiar={setPagina}
          />
          <p className="texto-ayuda">
            Existencias: {datos.existencias} · Disponibles: {datos.disponibles} · Prestado y Reservado solo
            cambian por los procesos de préstamo, reserva y devolución.
          </p>
        </>
      )}

      {dialogo?.tipo === 'confirmar' && (
        <Modal
          titulo="¿Eliminar existencia?"
          icono="basura"
          acciones={
            <>
              <Boton variante="secundario" onClick={() => setDialogo(null)}>
                Cancelar
              </Boton>
              <Boton variante="peligro" onClick={() => darDeBaja(dialogo.ejemplar)}>
                Eliminar existencia
              </Boton>
            </>
          }
        >
          Se retirará el ejemplar {folioEjemplar(dialogo.ejemplar.idEjemplar)} ({dialogo.ejemplar.estado}) del
          inventario y se actualizará la cantidad de existencias. El historial de préstamos del ejemplar se
          conserva.
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
