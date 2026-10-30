import { useIonRouter } from '@ionic/react';
import { Pantalla } from '../../components/layout/Pantalla';
import { Boton } from '../../components/ui/Boton';

export function NoEncontradoPage() {
  const router = useIonRouter();
  return (
    <Pantalla titulo="Consulta de libros">
      <p className="texto-ayuda">La pantalla que buscas no existe.</p>
      <Boton onClick={() => router.push('/consulta', 'root', 'replace')}>Ir a la consulta de libros</Boton>
    </Pantalla>
  );
}
