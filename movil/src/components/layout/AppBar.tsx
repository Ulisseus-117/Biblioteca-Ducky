import { IonHeader, IonIcon, IonMenuToggle } from '@ionic/react';
import { menu, personOutline } from 'ionicons/icons';

/** Mobile/AppBar del prototipo: menú de 3 líneas, título de la pantalla y avatar del usuario. */
export function AppBar({ titulo }: { titulo: string }) {
  return (
    <IonHeader className="app-bar ion-no-border">
      <div className="app-bar__contenido">
        <IonMenuToggle autoHide={false}>
          <button type="button" className="app-bar__menu" aria-label="Abrir menú">
            <IonIcon icon={menu} />
          </button>
        </IonMenuToggle>
        <h1 className="app-bar__titulo">{titulo}</h1>
        <span className="app-bar__avatar" aria-hidden="true">
          <IonIcon icon={personOutline} />
        </span>
      </div>
    </IonHeader>
  );
}
