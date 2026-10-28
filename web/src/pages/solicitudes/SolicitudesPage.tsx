import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { CampoSeleccion, CampoTexto } from '../../components/ui/Campo';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';
import { COLOR_ESTADO_SOLICITUD } from '../../config/colores';
import { Insignia } from '../../components/ui/Insignia';
import { Paginacion } from '../../components/ui/Paginacion';
import { Tabla, type Columna } from '../../components/ui/Tabla';
import { useConsulta, useOrden } from '../../hooks/useConsulta';
import { solicitudesService, type FiltrosSolicitudes } from '../../services/solicitudes.service';
import { ESTADOS_SOLICITUD, type SolicitudResumen } from '../../types/modelos';
import { folioSolicitud, formatoFecha, formatoMoneda, numeroOVacio } from '../../utils/formato';

const FILTROS_INICIALES: FiltrosSolicitudes = {
  folio: '',
  fechaDesde: '',
  fechaHasta: '',
  estado: '',
  costoMin: '',
  costoMax: '',
};

export function SolicitudesPage() {
  const navegar = useNavigate();
  const [borrador, setBorrador] = useState(FILTROS_INICIALES);
  const [textoFolio, setTextoFolio] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(1);
  const { orden, dir, alternar } = useOrden('folio', 'desc');
  const { datos, cargando, error } = useConsulta(
    () => solicitudesService.listar({ ...filtros, orden, dir, pagina }),
    [filtros, orden, dir, pagina],
  );

  const columnas: Columna<SolicitudResumen>[] = [
    { clave: 'folio', titulo: 'Folio', ordenable: true, render: (s) => folioSolicitud(s.idSolicitud) },
    { clave: 'fecha', titulo: 'Fecha', ordenable: true, render: (s) => formatoFecha(s.fecha) },
    { clave: 'titulos', titulo: 'Títulos', ordenable: true, render: (s) => s.numLibrosDiferentes },
    { clave: 'ejemplares', titulo: 'Ejemplares', ordenable: true, render: (s) => s.numEjemplaresTotales },
    { clave: 'total', titulo: 'Costo total', ordenable: true, render: (s) => formatoMoneda(s.total) },
    {
      clave: 'estado',
      titulo: 'Estatus',
      ordenable: true,
      render: (s) => <Insignia color={COLOR_ESTADO_SOLICITUD[s.estado]}>{s.estado}</Insignia>,
    },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      render: (s) => (
        <Boton chico onClick={() => navegar(`/solicitudes/${s.idSolicitud}`)}>
          Ver detalles
        </Boton>
      ),
    },
  ];

  return (
    <Pantalla
      migas={[{ texto: 'Solicitud de compra', ruta: '/solicitudes' }, { texto: 'Solicitudes generadas' }]}
    >
      <EncabezadoPagina
        titulo="Solicitudes generadas"
        descripcion="Historial de solicitudes de compra enviadas a Tesorería y su resolución."
      >
        <Link to="/solicitudes/nueva" className="btn btn--primario">
          Nueva solicitud +
        </Link>
      </EncabezadoPagina>

      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          setPagina(1);
          setFiltros({ ...borrador, folio: numeroOVacio(textoFolio.replace(/\D/g, '')) });
        }}
      >
        <div className="fila">
          <CampoTexto
            etiqueta="Folio"
            placeholder="SC-0001"
            value={textoFolio}
            onChange={(e) => setTextoFolio(e.target.value)}
          />
          <CampoTexto
            etiqueta="Fecha desde"
            type="date"
            value={borrador.fechaDesde}
            onChange={(e) => setBorrador({ ...borrador, fechaDesde: e.target.value })}
          />
          <CampoTexto
            etiqueta="Fecha hasta"
            type="date"
            value={borrador.fechaHasta}
            onChange={(e) => setBorrador({ ...borrador, fechaHasta: e.target.value })}
          />
          <CampoSeleccion
            etiqueta="Estatus"
            vacio="Todos"
            opciones={ESTADOS_SOLICITUD.map((e) => ({ valor: e, texto: e }))}
            value={borrador.estado}
            onChange={(e) =>
              setBorrador({ ...borrador, estado: e.target.value as FiltrosSolicitudes['estado'] })
            }
          />
          <CampoTexto
            etiqueta="Costo mín. (MXN)"
            type="number"
            value={borrador.costoMin}
            onChange={(e) => setBorrador({ ...borrador, costoMin: numeroOVacio(e.target.value) })}
          />
          <CampoTexto
            etiqueta="Costo máx. (MXN)"
            type="number"
            value={borrador.costoMax}
            onChange={(e) => setBorrador({ ...borrador, costoMax: numeroOVacio(e.target.value) })}
          />
        </div>
        <div className="acciones acciones--derecha">
          <Boton
            variante="secundario"
            onClick={() => {
              setBorrador(FILTROS_INICIALES);
              setTextoFolio('');
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
        clave={(s) => s.idSolicitud}
        orden={orden}
        dir={dir}
        alOrdenar={alternar}
        cargando={cargando}
        mensajeVacio="No hay solicitudes con esos filtros."
      />
      {datos && (
        <Paginacion
          pagina={datos.pagina}
          total={datos.total}
          tamanoPagina={datos.tamanoPagina}
          sustantivo="solicitudes"
          alCambiar={setPagina}
        />
      )}
    </Pantalla>
  );
}
