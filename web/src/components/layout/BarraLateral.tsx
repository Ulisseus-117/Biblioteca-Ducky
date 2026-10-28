import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo-ducky.png';
import { MENU } from '../../config/navegacion';
import { useAuth } from '../../context/AuthContext';
import { Icono } from '../ui/Icono';

/** Sidebar naranja (primary gold): solo muestra las opciones que permite el rol del usuario. */
export function BarraLateral() {
  const { tienePermiso } = useAuth();
  const elementos = MENU.filter((e) => tienePermiso(...e.permisos));

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <img src={logo} alt="Logo Universidad Ducky" />
        <span>
          Biblioteca
          <br />
          Universidad Ducky
        </span>
      </div>
      <nav className="sidebar__menu" aria-label="Menú principal">
        {elementos.map((e) => (
          <NavLink
            key={e.ruta}
            to={e.ruta}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item--activo' : ''}`}
          >
            <Icono nombre={e.icono} />
            {e.etiqueta}
          </NavLink>
        ))}
      </nav>
      <p className="sidebar__pie">Sistema de Préstamos · Duck Tech</p>
    </aside>
  );
}
