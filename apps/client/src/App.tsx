import { AuthProvider } from './context/AuthProvider';
import { AppRoutes } from './routes/AppRoutes';
import { firebaseConfigured } from './firebase';
import { FirebaseSetupPage } from './pages/system/FirebaseSetupPage';

export default function App() {
  if (!firebaseConfigured) return <FirebaseSetupPage />;
  return <AuthProvider><AppRoutes /></AuthProvider>;
}
