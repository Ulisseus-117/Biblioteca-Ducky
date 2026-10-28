import { useNavigate } from 'react-router-dom';
import { Pantalla } from '../../components/layout/Pantalla';
import { Boton } from '../../components/ui/Boton';
import { Modal } from '../../components/ui/Modal';

export function AccesoDenegadoPage() {
  const navegar = useNavigate();
  return (
    <Pantalla migas={[{ texto: 'Acceso denegado' }]}>
      <Modal titulo="Acceso denegado" acciones={<Boton onClick={() => navegar('/')}>Ir al inicio</Boton>}>
        Tu perfil no tiene permiso para entrar a esta sección. Si crees que es un error, acude con el
        administrador.
      </Modal>
    </Pantalla>
  );
}
