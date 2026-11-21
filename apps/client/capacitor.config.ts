// Configuración que Capacitor lee para preparar la app móvil.
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Identificador único de la app en Android/iOS.
  appId: 'co.edu.uao.asesorias',
  appName: 'Asesorías UAO',
  // Carpeta que Vite genera y Capacitor copia al proyecto nativo.
  webDir: 'dist',
};

export default config;
