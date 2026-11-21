// Protege pantallas según sesión, perfil y rol; también redirige al espacio de inicio.
import type { ReactNode } from 'react';
import { IonContent, IonLoading, IonPage } from '@ionic/react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';
import { ProfilePendingPage } from '../pages/auth/ProfilePendingPage';

// Componente guardia: bloquea la pantalla si falta sesión o el rol no coincide.
export function UserRoutes({ role, children }: { role: UserRole; children: ReactNode }) {
  const { profile, user, loading } = useAuth();
  if (loading) return <IonPage><IonContent><IonLoading isOpen message="Cargando…" /></IonContent></IonPage>;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile) return <ProfilePendingPage />;
  if (profile.rol !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Redirige desde / al primer espacio adecuado para el rol de la persona.
export function UserHomeRoute() {
  const { profile, user, loading } = useAuth();
  if (loading) return <IonPage><IonContent><IonLoading isOpen message="Cargando tu perfil…" /></IonContent></IonPage>;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile) return <ProfilePendingPage />;
  return <Navigate to={profile.rol === 'profesor' ? '/horarios' : '/buscar'} replace />;
}
