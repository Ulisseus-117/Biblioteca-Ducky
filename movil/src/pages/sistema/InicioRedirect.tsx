import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/** Pantalla inicial según el rol: todos los roles entran a la consulta de libros. */
export function InicioRedirect() {
  const { usuario } = useAuth();
  return <Navigate to={usuario ? '/consulta' : '/login'} replace />;
}
