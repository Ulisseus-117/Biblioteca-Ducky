import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Exige sesión iniciada. Es solo para la navegación: la API vuelve a validar
 * el permiso catalogo.consultar en cada petición.
 */
export function RutaProtegida({ children }: { children: ReactElement }) {
  const { usuario } = useAuth();
  const { pathname, search } = useLocation();
  if (!usuario) return <Navigate to="/login" replace state={{ desde: pathname + search }} />;
  return children;
}
