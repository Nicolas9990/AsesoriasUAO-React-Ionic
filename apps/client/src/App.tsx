// Componente raíz: verifica la configuración de Firebase y conecta sesión con rutas.
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { firebaseConfigured } from './firebase';
import { FirebaseSetupPage } from './pages/system/FirebaseSetupPage';

// Si Firebase no está configurado, se explica cómo conectarlo antes de iniciar la app.
export default function App() {
  if (!firebaseConfigured) return <FirebaseSetupPage />;
  return <AuthProvider><AppRoutes /></AuthProvider>;
}
