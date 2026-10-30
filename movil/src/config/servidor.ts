import { Capacitor } from '@capacitor/core';

/**
 * URL de la API:
 * - Navegador (npm run dev): '/api', que Vite reenvía al puerto 3000 de la PC.
 * - Android: VITE_API_URL (movil/.env) si se definió al compilar; si no, 10.0.2.2, que es la PC vista
 *   desde el emulador. Para un teléfono físico se compila con la IP de la PC en VITE_API_URL.
 */
const URL_EMULADOR_ANDROID = 'http://10.0.2.2:3000/api';

export const URL_API: string = (
  import.meta.env.VITE_API_URL || (Capacitor.isNativePlatform() ? URL_EMULADOR_ANDROID : '/api')
).replace(/\/+$/, '');
