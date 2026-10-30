import { IonContent, IonPage } from '@ionic/react';
import type { ReactNode } from 'react';
import { AppBar } from './AppBar';

/** Estructura común de las pantallas con sesión: AppBar naranja y cuerpo gris con margen de 16 px. */
export function Pantalla({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <IonPage>
      <AppBar titulo={titulo} />
      <IonContent className="pantalla">
        <div className="pantalla__cuerpo">{children}</div>
      </IonContent>
    </IonPage>
  );
}
