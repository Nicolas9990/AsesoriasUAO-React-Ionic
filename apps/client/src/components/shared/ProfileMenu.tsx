import { IonButton, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import { useAuth } from '../../context/AuthContext';
import { useProfilePhoto } from '../../hooks/useProfilePhoto';

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
}

export function ProfileMenu() {
  const { profile, signOutUser } = useAuth();
  const { photo, saving, error, changePhoto, removePhoto } = useProfilePhoto();
  return <>
    <IonButton id="profile-trigger" className="profile-button" fill="clear">
      {photo
        ? <img className="profile-avatar" src={photo} alt="Foto de perfil" />
        : <span className="profile-avatar profile-initials">{initials(profile?.nombre ?? '') || '?'}</span>}
    </IonButton>
    <IonPopover trigger="profile-trigger" triggerAction="click" dismissOnSelect>
      <IonList lines="none">
        <IonItem>
          <IonLabel>
            <h2>{profile?.nombre}</h2>
            <p>{profile?.rol === 'profesor' ? 'Profesor' : 'Estudiante'}</p>
          </IonLabel>
        </IonItem>
        <IonItem button detail={false} disabled={saving} onClick={() => void changePhoto()}>
          <IonLabel>{photo ? 'Cambiar foto' : 'Agregar foto'}</IonLabel>
        </IonItem>
        {photo && <IonItem button detail={false} disabled={saving} onClick={() => void removePhoto()}>
          <IonLabel>Quitar foto</IonLabel>
        </IonItem>}
        {error && <IonItem><IonLabel color="danger" className="ion-text-wrap">{error}</IonLabel></IonItem>}
        <IonItem button detail={false} onClick={() => void signOutUser()}>
          <IonLabel color="danger">Cerrar sesión</IonLabel>
        </IonItem>
      </IonList>
    </IonPopover>
  </>;
}
