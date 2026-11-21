// Configura el servidor y la compilación de Vite para reconocer JSX de React.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Activa el plugin React en el servidor de desarrollo y en la compilación.
export default defineConfig({
  plugins: [react()],
});
