import { IonIcon, useIonRouter } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';

/** Enlace "← Volver / Nueva búsqueda / Resultados / Ficha del libro" de la parte superior del cuerpo. */
export function EnlaceVolver({ texto, ruta }: { texto: string; ruta: string }) {
  const router = useIonRouter();
  return (
    <button type="button" className="enlace-volver" onClick={() => router.push(ruta, 'back', 'push')}>
      <IonIcon icon={arrowBack} aria-hidden="true" />
      {texto}
    </button>
  );
}
