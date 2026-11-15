import { IonApp, IonContent, IonPage, IonTitle } from '@ionic/react';

export function FirebaseSetupPage() {
  return <IonApp><IonPage><IonContent className="setup-content"><div className="setup-card"><p className="eyebrow">CONFIGURACIÓN INICIAL</p><IonTitle>Conecta el proyecto con Firebase</IonTitle><p>Copia <code>.env.example</code> como <code>.env.local</code>, completa la configuración de tu aplicación web Firebase y activa Authentication con correo y contraseña.</p><p>Los datos de Firebase se leen desde variables de entorno y no se guardan en el repositorio.</p></div></IonContent></IonPage></IonApp>;
}
