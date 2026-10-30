import { IonContent, IonIcon, IonMenu, IonMenuToggle, useIonRouter } from '@ionic/react';
import { searchOutline } from 'ionicons/icons';
import logo from '../../assets/logo-ducky.png';
import { useAuth } from '../../context/AuthContext';

/**
 * Menú lateral (M03): en móvil solo existe "Consulta de libros".
 * Abajo muestra al usuario, su rol y "Cerrar sesión".
 */
export function MenuLateral() {
  const { usuario, cerrarSesion } = useAuth();
  const router = useIonRouter();

  return (
    <IonMenu contentId="contenido-principal" type="overlay" disabled={!usuario} className="menu">
      <IonContent className="menu__contenido">
        <div className="menu__cuerpo">
          <img className="menu__logo" src={logo} alt="Logo Universidad Ducky" />
          <IonMenuToggle autoHide={false}>
            <button
              type="button"
              className="menu__item"
              onClick={() => router.push('/consulta', 'root', 'replace')}
            >
              <IonIcon icon={searchOutline} aria-hidden="true" />
              Consulta de libros
            </button>
          </IonMenuToggle>
          <div className="menu__pie">
            <span className="menu__usuario">{usuario?.matricula}</span>
            <span className="menu__rol">{usuario?.rol}</span>
            <IonMenuToggle autoHide={false}>
              <button type="button" className="menu__salir" onClick={() => void cerrarSesion()}>
                Cerrar sesión
              </button>
            </IonMenuToggle>
          </div>
        </div>
      </IonContent>
    </IonMenu>
  );
}
