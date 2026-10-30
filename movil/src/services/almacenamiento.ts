import { Preferences } from '@capacitor/preferences';

/**
 * Almacenamiento persistente del dispositivo para el token de sesión.
 * En Android usa SharedPreferences y en el navegador localStorage (plugin Preferences de Capacitor).
 */
const CLAVE_TOKEN = 'ducky.token';

export const almacenamiento = {
  obtenerToken: async (): Promise<string | null> => (await Preferences.get({ key: CLAVE_TOKEN })).value,
  guardarToken: (token: string): Promise<void> => Preferences.set({ key: CLAVE_TOKEN, value: token }),
  borrarToken: (): Promise<void> => Preferences.remove({ key: CLAVE_TOKEN }),
};
