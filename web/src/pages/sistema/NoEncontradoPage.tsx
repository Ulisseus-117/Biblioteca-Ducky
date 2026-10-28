import { Link } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { EncabezadoPagina } from '../../components/ui/EncabezadoPagina';

export function NoEncontradoPage() {
  return (
    <Pantalla migas={[{ texto: 'Página no encontrada' }]}>
      <EncabezadoPagina titulo="Página no encontrada" descripcion="La dirección que buscas no existe." />
      <Link to="/" className="btn btn--primario" style={{ alignSelf: 'flex-start' }}>
        Ir al inicio
      </Link>
    </Pantalla>
  );
}
