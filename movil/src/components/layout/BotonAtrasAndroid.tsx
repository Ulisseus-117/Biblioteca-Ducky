import { App as AppNativa } from '@capacitor/app';
import { useIonRouter } from '@ionic/react';
import { useEffect } from 'react';

/**
 * Botón "atrás" de Android: Ionic ya regresa entre pantallas; aquí solo se cierra
 * la app cuando ya no hay pantalla anterior (prioridad -1 = la más baja).
 */
export function BotonAtrasAndroid() {
  const router = useIonRouter();

  useEffect(() => {
    const manejar = (evento: Event) => {
      (evento as CustomEvent).detail.register(-1, () => {
        if (!router.canGoBack()) void AppNativa.exitApp();
      });
    };
    document.addEventListener('ionBackButton', manejar);
    return () => document.removeEventListener('ionBackButton', manejar);
  }, [router]);

  return null;
}
