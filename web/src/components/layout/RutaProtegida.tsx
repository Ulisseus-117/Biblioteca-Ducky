import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AccesoDenegadoPage } from '../../pages/sistema/AccesoDenegadoPage';

interface Props {
  permisos?: string[];
  children: ReactNode;
}

/** Exige sesión iniciada y, opcionalmente, alguno de los permisos indicados. */
export function RutaProtegida({ permisos, children }: Props) {
  const { usuario, cargando, tienePermiso } = useAuth();
  const ubicacion = useLocation();

  if (cargando) return <div className="centrado">Cargando…</div>;
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  if (permisos && !tienePermiso(...permisos)) return <AccesoDenegadoPage />;
  return <>{children}</>;
}
