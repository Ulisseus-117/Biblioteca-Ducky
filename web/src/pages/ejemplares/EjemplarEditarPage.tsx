import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { CampoSeleccion } from '../../components/ui/Campo';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';
import { Icono } from '../../components/ui/Icono';
import { mensajeDeError, useConsulta } from '../../hooks/useConsulta';
import { catalogosService } from '../../services/catalogos.service';
import { ejemplaresService } from '../../services/ejemplares.service';
import {
  ESTADOS_EJEMPLAR,
  MODALIDADES,
  type Ejemplar,
  type EstadoEjemplar,
  type Modalidad,
} from '../../types/modelos';
import { folioEjemplar, textoUbicacion } from '../../utils/formato';

const ESTADOS_AUTOMATICOS: EstadoEjemplar[] = ['Prestado', 'Reservado'];

export function EjemplarEditarPage() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [ejemplar, setEjemplar] = useState<Ejemplar | null>(null);
  const [cambios, setCambios] = useState<{
    modalidad: Modalidad;
    idUbicacion: number;
    estado: EstadoEjemplar;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const ubicaciones = useConsulta(() => catalogosService.ubicaciones(), []);

  useEffect(() => {
    ejemplaresService
      .obtener(Number(id))
      .then((e) => {
        setEjemplar(e);
        setCambios({ modalidad: e.modalidad, idUbicacion: e.idUbicacion, estado: e.estado });
      })
      .catch((e) => setError(mensajeDeError(e)));
  }, [id]);

  const bloqueado = ejemplar ? ESTADOS_AUTOMATICOS.includes(ejemplar.estado) : false;
  // Prestado y Reservado no se eligen a mano: solo se muestran si ya es el estado actual
  const estadosPermitidos = bloqueado
    ? [ejemplar!.estado]
    : ESTADOS_EJEMPLAR.filter((e) => !ESTADOS_AUTOMATICOS.includes(e));

  const guardar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!ejemplar || !cambios) return;
    setGuardando(true);
    setError(null);
    try {
      await ejemplaresService.actualizar(ejemplar.idEjemplar, cambios);
      navegar(`/ejemplares?isbn=${encodeURIComponent(ejemplar.isbn)}`, {
        state: { aviso: `Se actualizó el ejemplar ${folioEjemplar(ejemplar.idEjemplar)}.` },
      });
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Pantalla migas={[{ texto: 'Ejemplares', ruta: '/ejemplares' }, { texto: 'Cambio de ejemplar' }]}>
      <EncabezadoPagina
        titulo="Cambio de ejemplar"
        descripcion={
          ejemplar
            ? `${folioEjemplar(ejemplar.idEjemplar)} · "${ejemplar.titulo}" · ISBN ${ejemplar.isbn}`
            : ''
        }
      >
        <Link to="/ejemplares" className="btn btn--primario">
          <Icono nombre="flechaIzquierda" tamano={16} /> Volver
        </Link>
      </EncabezadoPagina>

      {cambios && (
        <form className="formulario formulario--angosto" onSubmit={guardar} noValidate>
          {bloqueado && (
            <Alerta tipo="advertencia">
              El ejemplar está {ejemplar!.estado.toLowerCase()}. Su estado solo cambia por los procesos de
              préstamo, reserva y devolución; aquí solo puedes cambiar modalidad y ubicación.
            </Alerta>
          )}
          {error && <Alerta tipo="error">{error}</Alerta>}
          <CampoSeleccion
            etiqueta="Modalidad"
            opciones={MODALIDADES.map((m) => ({ valor: m, texto: m }))}
            value={cambios.modalidad}
            onChange={(e) => setCambios({ ...cambios, modalidad: e.target.value as Modalidad })}
          />
          <CampoSeleccion
            etiqueta="Ubicación física"
            opciones={(ubicaciones.datos ?? []).map((u) => ({
              valor: u.idUbicacion,
              texto: textoUbicacion(u),
            }))}
            value={cambios.idUbicacion}
            onChange={(e) => setCambios({ ...cambios, idUbicacion: Number(e.target.value) })}
          />
          <CampoSeleccion
            etiqueta="Estado"
            opciones={estadosPermitidos.map((e) => ({ valor: e, texto: e }))}
            value={cambios.estado}
            disabled={bloqueado}
            onChange={(e) => setCambios({ ...cambios, estado: e.target.value as EstadoEjemplar })}
          />
          <div className="acciones">
            <Boton type="submit" disabled={guardando}>
              Guardar cambios
            </Boton>
            <Boton variante="secundario" onClick={() => navegar('/ejemplares')}>
              Cancelar
            </Boton>
          </div>
        </form>
      )}
      {!cambios && error && <Alerta tipo="error">{error}</Alerta>}
    </Pantalla>
  );
}
