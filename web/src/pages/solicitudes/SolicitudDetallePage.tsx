import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';
import { Icono } from '../../components/ui/Icono';
import { COLOR_ESTADO_SOLICITUD } from '../../config/colores';
import { Insignia } from '../../components/ui/Insignia';
import { Tabla, type Columna } from '../../components/ui/Tabla';
import { mensajeDeError, useConsulta } from '../../hooks/useConsulta';
import { solicitudesService } from '../../services/solicitudes.service';
import type { DetalleSolicitud, EstadoSolicitud } from '../../types/modelos';
import { folioSolicitud, formatoFecha, formatoMoneda } from '../../utils/formato';

const COLUMNAS: Columna<DetalleSolicitud>[] = [
  { clave: 'titulo', titulo: 'Título', render: (d) => d.titulo },
  { clave: 'autor', titulo: 'Autor', render: (d) => d.autores ?? '—' },
  { clave: 'isbn', titulo: 'ISBN', render: (d) => d.isbn },
  { clave: 'ejemplares', titulo: 'Ejemplares', render: (d) => d.numEjemplares },
  { clave: 'costo', titulo: 'Costo unitario', render: (d) => formatoMoneda(d.costoUnitario) },
  { clave: 'subtotal', titulo: 'Subtotal', render: (d) => formatoMoneda(d.subtotal) },
];

export function SolicitudDetallePage() {
  const { id } = useParams();
  const avisoInicial = (useLocation().state as { aviso?: string } | null)?.aviso;
  const [aviso, setAviso] = useState(avisoInicial);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const { datos: s, error, recargar } = useConsulta(() => solicitudesService.obtener(Number(id)), [id]);

  // Tesorería resuelve la solicitud fuera del sistema; aquí solo se registra su respuesta
  const registrarRespuesta = async (estado: EstadoSolicitud) => {
    try {
      await solicitudesService.cambiarEstado(Number(id), estado);
      setAviso(`La solicitud quedó como "${estado}".`);
      setErrorAccion(null);
      void recargar();
    } catch (e) {
      setErrorAccion(mensajeDeError(e));
    }
  };

  return (
    <Pantalla
      migas={[
        { texto: 'Solicitud de compra', ruta: '/solicitudes' },
        { texto: s ? folioSolicitud(s.idSolicitud) : 'Detalle' },
      ]}
    >
      <EncabezadoPagina
        titulo={s ? `Solicitud ${folioSolicitud(s.idSolicitud)}` : 'Solicitud'}
        descripcion={s ? `Generada el ${formatoFecha(s.fecha)} por ${s.matricula}` : undefined}
      >
        <Link to="/solicitudes" className="btn btn--primario">
          <Icono nombre="flechaIzquierda" tamano={16} /> Volver
        </Link>
      </EncabezadoPagina>

      {aviso && <Alerta tipo="exito">{aviso}</Alerta>}
      {(error || errorAccion) && <Alerta tipo="error">{error ?? errorAccion}</Alerta>}

      {s && (
        <>
          <div className="ficha">
            <div className="ficha__dato">
              <span className="ficha__etiqueta">Estatus</span>
              <span>
                <Insignia color={COLOR_ESTADO_SOLICITUD[s.estado]}>{s.estado}</Insignia>
              </span>
            </div>
            <div className="ficha__dato">
              <span className="ficha__etiqueta">Títulos diferentes</span>
              <span>{s.numLibrosDiferentes}</span>
            </div>
            <div className="ficha__dato">
              <span className="ficha__etiqueta">Ejemplares totales</span>
              <span>{s.numEjemplaresTotales}</span>
            </div>
          </div>
          <Tabla columnas={COLUMNAS} filas={s.detalles} clave={(d) => d.idDetalleSolicitud} />
          <div className="total">
            Costo total: <strong>{formatoMoneda(s.total)} MXN</strong>
          </div>
          {s.estado === 'Enviado a tesorería' && (
            <div className="acciones">
              <span className="texto-ayuda">Registrar respuesta de Tesorería:</span>
              <Boton variante="secundario" onClick={() => registrarRespuesta('Rechazado')}>
                Rechazada
              </Boton>
              <Boton onClick={() => registrarRespuesta('Aceptado')}>Aceptada</Boton>
            </div>
          )}
        </>
      )}
    </Pantalla>
  );
}
