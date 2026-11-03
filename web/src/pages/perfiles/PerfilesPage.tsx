import { Link, useLocation } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Alerta } from '../../components/ui/Alerta';
import { Icono } from '../../components/ui/Icono';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';
import { Insignia } from '../../components/ui/Insignia';
import { Tabla, type Columna } from '../../components/ui/Tabla';
import { FUNCIONES, funcionesActivas, PERFIL_ADMINISTRADOR } from '../../config/permisos';
import { useConsulta } from '../../hooks/useConsulta';
import { perfilesService } from '../../services/perfiles.service';
import type { Perfil } from '../../types/modelos';

export function PerfilesPage() {
  const avisoInicial = (useLocation().state as { aviso?: string } | null)?.aviso;
  const { datos: catalogo } = useConsulta(() => perfilesService.permisos(), []);
  const { datos: perfiles, cargando, error } = useConsulta(() => perfilesService.listar(), []);

  const columnas: Columna<Perfil>[] = [
    { clave: 'perfil', titulo: 'Perfil', ancho: 240, render: (p) => p.nombre },
    {
      clave: 'descripcion',
      titulo: 'Descripción',
      render: (p) => <span className="texto-secundario">{p.descripcion}</span>,
    },
    { clave: 'usuarios', titulo: 'Usuarios', ancho: 120, render: (p) => p.totalUsuarios },
    {
      clave: 'permisos',
      titulo: 'Permisos',
      ancho: 180,
      render: (p) => {
        const total = funcionesActivas(p, catalogo ?? []).size;
        return (
          <Insignia color={total === FUNCIONES.length ? 'azul' : 'gris'}>
            {total} de {FUNCIONES.length}
          </Insignia>
        );
      },
    },
    {
      clave: 'acciones',
      titulo: '',
      ancho: 220,
      render: (p) => (
        <Link to={`/usuarios/perfiles/${p.idRol}`} className="btn btn--secundario btn--chico">
          {p.nombre === PERFIL_ADMINISTRADOR ? 'Ver permisos' : 'Editar permisos'}
        </Link>
      ),
    },
  ];

  return (
    <Pantalla migas={[{ texto: 'Gestión de usuarios', ruta: '/usuarios' }, { texto: 'Perfiles y permisos' }]}>
      <EncabezadoPagina
        titulo="Perfiles y permisos"
        descripcion="Define qué funciones puede usar cada perfil. Solo el administrador accede a esta pantalla."
      >
        <Link to="/usuarios" className="btn btn--primario">
          <Icono nombre="flechaIzquierda" tamano={16} /> Volver
        </Link>
      </EncabezadoPagina>

      {avisoInicial && <Alerta tipo="exito">{avisoInicial}</Alerta>}
      {error && <Alerta tipo="error">{error}</Alerta>}
      <Tabla
        columnas={columnas}
        filas={perfiles ?? []}
        clave={(p) => p.idRol}
        cargando={cargando}
        mensajeVacio="No hay perfiles registrados."
        clara
      />
      <div className="acciones">
        <Link to="/usuarios/perfiles/nuevo" className="btn btn--secundario btn--chico">
          Crear perfil nuevo
        </Link>
      </div>
    </Pantalla>
  );
}
