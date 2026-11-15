import { useState } from 'react';
import {
  IonButton, IonContent, IonPage, IonText, IonTitle, IonToolbar,
} from '@ionic/react';
import { useAuth } from '../../hooks/useAuth';

export function ProfilePendingPage() {
  const { signOutUser, error, verificationPending, resendVerification, refreshProfile } = useAuth();
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');
  async function run(action: () => Promise<void>, confirmation: string) {
    setMessage('');
    setActionError('');
    try {
      await action();
      setMessage(confirmation);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'No se pudo completar la solicitud.');
    }
  }
  return <IonPage><IonToolbar><IonTitle>Asesorías UAO</IonTitle></IonToolbar><IonContent className="home-content"><main className="pending-card"><p className="eyebrow">PERFIL PENDIENTE</p><h1>{verificationPending ? 'Confirma tu correo institucional.' : 'Tu cuenta aún no tiene un perfil habilitado.'}</h1><p>{error || 'Pide al equipo administrador que revise tu perfil en Firestore. Los roles de profesor se asignan desde el entorno administrativo.'}</p>{verificationPending && <><IonButton onClick={() => void run(resendVerification, 'Enviamos otro enlace de confirmación.')}>Reenviar correo</IonButton><IonButton fill="outline" onClick={() => void run(refreshProfile, 'Revisamos tu cuenta.')}>Ya confirmé mi correo</IonButton></>}{message && <p>{message}</p>}{actionError && <IonText color="danger"><p>{actionError}</p></IonText>}<IonButton fill="clear" onClick={() => void signOutUser()}>Cerrar sesión</IonButton></main></IonContent></IonPage>;
}
