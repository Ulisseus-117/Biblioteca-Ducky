import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Boton } from '../../components/ui/Boton';
import { BotonIcono } from '../../components/ui/BotonIcono';
import { CampoSeleccion, CampoTexto } from '../../components/ui/Campo';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';
import { COLOR_ROL } from '../../config/colores';
import { Insignia } from '../../components/ui/Insignia';
import { Modal } from '../../components/ui/Modal';
import { Paginacion } from '../../components/ui/Paginacion';
import { Tabla, type Columna } from '../../components/ui/Tabla';
import { mensajeDeError, useConsulta, useOrden } from '../../hooks/useConsulta';
import { catalogosService } from '../../services/catalogos.service';
import { usuariosService, type FiltrosUsuarios } from '../../services/usuarios.service';
import type { Usuario } from '../../types/modelos';

const FILTROS_INICIALES: FiltrosUsuarios = { matricula: '', idRol: '', estado: 'activo' };

type Dialogo =
  | { tipo: 'confirmar-baja' | 'confirmar-reactivar'; usuario: Usuario }
  | { tipo: 'exito' | 'rechazo'; titulo: string; mensaje: string };

export function UsuariosPage() {
  const navegar = useNavigate();
  const avisoInicial = (useLocation().state as { aviso?: string } | null)?.aviso;
  const [borrador, setBorrador] = useState(FILTROS_INICIALES);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(1);
  const { orden, dir, alternar } = useOrden('matricula');
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);

  const { datos: roles } = useConsulta(() => catalogosService.roles(), []);
  const { datos, cargando, error, recargar } = useConsulta(
    () => usuariosService.listar({ ...filtros, orden, dir, pagina }),
    [filtros, orden, dir, pagina],
  );

  const buscar = () => {
    setPagina(1);
    setFiltros(borrador);
  };

  const limpiar = () => {
    setBorrador(FILTROS_INICIALES);
    setFiltros(FILTROS_INICIALES);
    setPagina(1);
  };

  const confirmar = async (usuario: Usuario, accion: 'baja' | 'reactivar') => {
    try {
      if (accion === 'baja') {
        await usuariosService.desactivar(usuario.matricula);
        setDialogo({
          tipo: 'exito',
          titulo: 'Usuario desactivado',
          mensaje: `La cuenta ${usuario.matricula} ya no puede iniciar sesión.`,
        });
      } else {
        await usuariosService.reactivar(usuario.matricula);
        setDialogo({
          tipo: 'exito',
          titulo: 'Usuario reactivado',
          mensaje: `La cuenta ${usuario.matricula} vuelve a estar activa.`,
        });
      }
      void recargar();
    } catch (e) {
      setDialogo({
        tipo: 'rechazo',
        titulo: accion === 'baja' ? 'No se puede desactivar' : 'No se puede reactivar',
        mensaje: mensajeDeError(e),
      });
    }
  };

  const columnas: Columna<Usuario>[] = [
    {
      clave: 'matricula',
      titulo: 'Matrícula / Nómina',
      ordenable: true,
      ancho: 260,
      render: (u) => u.matricula,
    },
    {
      clave: 'rol',
      titulo: 'Rol',
      ordenable: true,
      ancho: 220,
      render: (u) => <Insignia color={COLOR_ROL[u.rol] ?? 'gris'}>{u.rol}</Insignia>,
    },
    {
      clave: 'estatus',
      titulo: 'Estatus',
      ordenable: true,
      ancho: 200,
      render: (u) => (
        <Insignia color={u.activo ? 'verde' : 'gris'}>{u.activo ? 'Activo' : 'Inactivo'}</Insignia>
      ),
    },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      render: (u) => (
        <div className="tabla__acciones">
          <BotonIcono
            icono="lapiz"
            etiqueta={`Editar ${u.matricula}`}
            onClick={() => navegar(`/usuarios/${encodeURIComponent(u.matricula)}/editar`)}
          />
          {u.activo ? (
            <BotonIcono
              icono="basura"
              variante="peligro"
              etiqueta={`Desactivar ${u.matricula}`}
              onClick={() => setDialogo({ tipo: 'confirmar-baja', usuario: u })}
            />
          ) : (
            <BotonIcono
              icono="reactivar"
              variante="exito"
              etiqueta={`Reactivar ${u.matricula}`}
              onClick={() => setDialogo({ tipo: 'confirmar-reactivar', usuario: u })}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <Pantalla migas={[{ texto: 'Gestión de usuarios', ruta: '/usuarios' }, { texto: 'Consulta' }]}>
      <EncabezadoPagina
        titulo="Gestión de usuarios"
        descripcion="Administra las cuentas: alta, baja, reactivación, cambio y consulta."
      >
        <Link to="/usuarios/nuevo" className="btn btn--primario">
          Nuevo usuario +
        </Link>
      </EncabezadoPagina>

      {avisoInicial && <Alerta tipo="exito">{avisoInicial}</Alerta>}

      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          buscar();
        }}
      >
        <div className="fila" style={{ gridTemplateColumns: '300px 240px 200px' }}>
          <CampoTexto
            etiqueta="Matrícula / Nómina"
            placeholder="Ej. A01234567"
            value={borrador.matricula}
            onChange={(e) => setBorrador({ ...borrador, matricula: e.target.value })}
          />
          <CampoSeleccion
            etiqueta="Rol"
            vacio="Todos los roles"
            opciones={(roles ?? []).map((r) => ({ valor: r.idRol, texto: r.nombre }))}
            value={borrador.idRol}
            onChange={(e) =>
              setBorrador({ ...borrador, idRol: e.target.value ? Number(e.target.value) : '' })
            }
          />
          <CampoSeleccion
            etiqueta="Estado"
            opciones={[
              { valor: 'activo', texto: 'Activo' },
              { valor: 'inactivo', texto: 'Inactivo' },
              { valor: 'todos', texto: 'Todos' },
            ]}
            value={borrador.estado}
            onChange={(e) =>
              setBorrador({ ...borrador, estado: e.target.value as FiltrosUsuarios['estado'] })
            }
          />
        </div>
        <div className="acciones acciones--derecha">
          <Boton variante="secundario" onClick={limpiar}>
            Limpiar
          </Boton>
          <Boton type="submit">Buscar</Boton>
        </div>
      </form>

      {error && <Alerta tipo="error">{error}</Alerta>}
      <Tabla
        columnas={columnas}
        filas={datos?.datos ?? []}
        clave={(u) => u.matricula}
        orden={orden}
        dir={dir}
        alOrdenar={alternar}
        cargando={cargando}
        mensajeVacio="No se encontró ningún usuario con esos datos."
      />
      {datos && (
        <Paginacion
          pagina={datos.pagina}
          total={datos.total}
          tamanoPagina={datos.tamanoPagina}
          sustantivo="usuarios"
          nota="La contraseña nunca se muestra."
          alCambiar={setPagina}
        />
      )}

      {dialogo?.tipo === 'confirmar-baja' && (
        <Modal
          titulo="¿Desactivar usuario?"
          icono="basura"
          acciones={
            <>
              <Boton variante="secundario" onClick={() => setDialogo(null)}>
                Cancelar
              </Boton>
              <Boton variante="peligro" onClick={() => confirmar(dialogo.usuario, 'baja')}>
                Desactivar
              </Boton>
            </>
          }
        >
          La cuenta {dialogo.usuario.matricula} ya no podrá iniciar sesión. Su historial se conserva y podrás
          reactivarla después.
        </Modal>
      )}
      {dialogo?.tipo === 'confirmar-reactivar' && (
        <Modal
          titulo="¿Reactivar usuario?"
          icono="reactivar"
          tono="info"
          acciones={
            <>
              <Boton variante="secundario" onClick={() => setDialogo(null)}>
                Cancelar
              </Boton>
              <Boton onClick={() => confirmar(dialogo.usuario, 'reactivar')}>Reactivar</Boton>
            </>
          }
        >
          La cuenta {dialogo.usuario.matricula} podrá volver a iniciar sesión con su rol actual (
          {dialogo.usuario.rol}).
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
