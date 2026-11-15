import type { PropsWithChildren } from 'react';
import {
  IonButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function PortalLayout({ title, children }: PropsWithChildren<{ title: string }>) {
  const { profile, signOutUser } = useAuth();
  const location = useLocation();
  const links = profile?.rol === 'estudiante'
    ? [['/buscar', 'Buscar asesorías'], ['/reservas', 'Mis reservas']]
    : [['/horarios', 'Mis horarios'], ['/solicitudes', 'Solicitudes']];
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="home-toolbar">
          <IonTitle>Asesorías UAO</IonTitle>
          <IonButtons slot="end"><IonButton onClick={() => void signOutUser()}>Salir</IonButton></IonButtons>
        </IonToolbar>
        <IonToolbar className="portal-nav">
          <IonButtons className="portal-nav-buttons">
            {links.map(([path, label]) => <IonButton key={path} fill={location.pathname === path ? 'solid' : 'clear'} routerLink={path}>{label}</IonButton>)}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="home-content">
        <main className="portal-shell">
          <p className="eyebrow">{profile?.rol === 'profesor' ? 'ESPACIO DOCENTE' : 'ESPACIO ESTUDIANTIL'}</p>
          <h1 className="portal-title">{title}</h1>
          {children}
        </main>
      </IonContent>
    </IonPage>
  );
}
