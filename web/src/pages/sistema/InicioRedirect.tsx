import { Navigate } from 'react-router-dom';
import { MENU } from '../../config/navegacion';
import { useAuth } from '../../context/AuthContext';

/** "Inicio" lleva a la primera sección que el rol puede ver (admin → usuarios, alumno → consulta). */
export function InicioRedirect() {
  const { tienePermiso } = useAuth();
  const primera = MENU.find((e) => tienePermiso(...e.permisos));
  return <Navigate to={primera?.ruta ?? '/consulta'} replace />;
}
