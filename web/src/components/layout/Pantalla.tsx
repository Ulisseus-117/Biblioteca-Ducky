import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BotonIcono } from '../ui/BotonIcono';
import { Icono } from '../ui/Icono';

export interface Miga {
  texto: string;
  ruta?: string;
}

/** Barra superior (migas + usuario) y tarjeta blanca de contenido, comunes a todas las pantallas. */
export function Pantalla({ migas, children }: { migas: Miga[]; children: ReactNode }) {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();

  const salir = () => {
    cerrarSesion();
    navegar('/login');
  };

  return (
    <>
      <header className="topbar">
        <nav className="breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Inicio</Link>
          {migas.map((m, i) => (
            <span key={m.texto} className="breadcrumb" style={{ gap: 8 }}>
              <Icono nombre="chevronDerecha" />
              {m.ruta && i < migas.length - 1 ? (
                <Link to={m.ruta}>{m.texto}</Link>
              ) : (
                <span className={i === migas.length - 1 ? 'breadcrumb__actual' : ''}>{m.texto}</span>
              )}
            </span>
          ))}
        </nav>
        <div className="topbar__usuario">
          <div className="avatar">
            <Icono nombre="usuario" />
          </div>
          <div className="topbar__info">
            <span className="topbar__nombre">{usuario?.matricula}</span>
            <span className="topbar__rol">{usuario?.rol}</span>
          </div>
          <BotonIcono icono="salir" etiqueta="Cerrar sesión" variante="neutro" onClick={salir} />
        </div>
      </header>
      <section className="content-card">{children}</section>
    </>
  );
}
