import {
  IonApp, IonLoading, IonRouterOutlet,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Navigate, Route } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthPage } from '../pages/auth/AuthPage';
import { FindAdvisorPage } from '../pages/student/FindAdvisorPage';
import { MyBookingsPage } from '../pages/student/MyBookingsPage';
import { ManageSchedulesPage } from '../pages/professor/ManageSchedulesPage';
import { ProfessorRequestsPage } from '../pages/professor/ProfessorRequestsPage';
import { UserRoutes, UserHomeRoute } from './UserRoutes';

export function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <IonApp><IonLoading isOpen message="Cargando…" /></IonApp>;

  return <IonApp><IonReactRouter><IonRouterOutlet>
    <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
    <Route path="/registro" element={user ? <Navigate to="/" replace /> : <AuthPage register />} />
    <Route path="/" element={user ? <UserHomeRoute /> : <Navigate to="/login" replace />} />
    <Route path="/buscar" element={<UserRoutes role="estudiante"><FindAdvisorPage /></UserRoutes>} />
    <Route path="/reservas" element={<UserRoutes role="estudiante"><MyBookingsPage /></UserRoutes>} />
    <Route path="/horarios" element={<UserRoutes role="profesor"><ManageSchedulesPage /></UserRoutes>} />
    <Route path="/solicitudes" element={<UserRoutes role="profesor"><ProfessorRequestsPage /></UserRoutes>} />
    <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
  </IonRouterOutlet></IonReactRouter></IonApp>;
}
