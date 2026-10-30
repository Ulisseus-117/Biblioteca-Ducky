import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'mx.ducky.biblioteca',
  appName: 'Biblioteca Ducky',
  webDir: 'dist',
  server: {
    // La API local corre en http://, así que la app también se sirve por http para evitar "mixed content".
    androidScheme: 'http',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: '#b67800',
    },
  },
};

export default config;
