import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';
import { Icono } from '../../components/ui/Icono';
import {
  FUNCION_BLOQUEADA_ADMIN,
  funcionesActivas,
  PERFIL_ADMINISTRADOR,
  permisosDeFunciones,
} from '../../config/permisos';
import { mensajeDeError, useConsulta } from '../../hooks/useConsulta';
import { perfilesService } from '../../services/perfiles.service';
import { ListaFunciones } from './ListaFunciones';

const AVISO_GUARDADO = 'Los cambios en los permisos se guardaron correctamente.';
const AVISO_BLOQUEO =
  'Acción no permitida: la gestión de usuarios y perfiles del administrador no se puede desactivar.';

export function PermisosPerfilPage() {
  const idRol = Number(useParams().idRol);
  const navegar = useNavigate();
  const { datos: perfil, error: errorPerfil } = useConsulta(() => perfilesService.obtener(idRol), [idRol]);
  const { datos: catalogo } = useConsulta(() => perfilesService.permisos(), []);
  /** null mientras el usuario no cambie nada: se muestran las funciones guardadas. */
  const [cambios, setCambios] = useState<Set<string> | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const activas = cambios ?? (perfil && catalogo ? funcionesActivas(perfil, catalogo) : new Set<string>());
  const esAdministrador = perfil?.nombre === PERFIL_ADMINISTRADOR;
  const nombre = perfil?.nombre ?? '';

  const cambiar = (clave: string, activa: boolean) => {
    if (esAdministrador && clave === FUNCION_BLOQUEADA_ADMIN && !activa) {
      setBloqueado(true);
      return;
    }
    const nuevas = new Set(activas);
    if (activa) nuevas.add(clave);
    else nuevas.delete(clave);
    setCambios(nuevas);
  };

  const guardar = async () => {
    if (!perfil || !catalogo) return;
    setGuardando(true);
    setError(null);
    try {
      await perfilesService.actualizarPermisos(
        idRol,
        permisosDeFunciones(activas, catalogo, perfil.permisos),
      );
      navegar('/usuarios/perfiles', { state: { aviso: AVISO_GUARDADO } });
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Pantalla
      migas={[{ texto: 'Gestión de usuarios', ruta: '/usuarios' }, { texto: `Permisos del ${nombre}` }]}
    >
      <EncabezadoPagina
        titulo={`Permisos · ${nombre}`}
        descripcion={
          esAdministrador
            ? 'Activa o desactiva las funciones del perfil Administrador. La gestión de usuarios y perfiles no se puede desactivar.'
            : `Activa o desactiva las funciones disponibles para el perfil ${nombre}.`
        }
      >
        <Link to="/usuarios/perfiles" className="btn btn--primario">
          <Icono nombre="flechaIzquierda" tamano={16} /> Volver
        </Link>
      </EncabezadoPagina>

      {errorPerfil && <Alerta tipo="error">{errorPerfil}</Alerta>}
      {bloqueado ? (
        <Alerta tipo="error">{AVISO_BLOQUEO}</Alerta>
      ) : (
        <Alerta tipo="info">Los cambios se aplican a todos los usuarios con este perfil.</Alerta>
      )}
      {error && <Alerta tipo="error">{error}</Alerta>}

      {perfil && <ListaFunciones activas={activas} alCambiar={cambiar} />}

      <div className="acciones">
        {bloqueado ? (
          <Link to="/usuarios/perfiles" className="btn btn--secundario">
            Volver a perfiles
          </Link>
        ) : (
          <>
            <Boton onClick={guardar} disabled={!perfil || guardando}>
              {guardando ? 'Guardando…' : 'Guardar permisos'}
            </Boton>
            <Link to="/usuarios/perfiles" className="btn btn--secundario">
              Cancelar
            </Link>
          </>
        )}
      </div>
    </Pantalla>
  );
}
