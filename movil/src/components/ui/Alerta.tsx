import { IonIcon } from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';
import type { ReactNode } from 'react';

export function Alerta({ children }: { children: ReactNode }) {
  return (
    <div className="alerta" role="alert">
      <IonIcon icon={alertCircleOutline} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
