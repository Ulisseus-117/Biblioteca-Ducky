import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

/** Ajustes que solo aplican en el teléfono (Android). En el navegador no hace nada. */
export async function configurarPlataforma(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await StatusBar.setStyle({ style: Style.Dark });
  await StatusBar.setBackgroundColor({ color: '#8a5b00' }).catch(() => undefined);
  await SplashScreen.hide();
}
