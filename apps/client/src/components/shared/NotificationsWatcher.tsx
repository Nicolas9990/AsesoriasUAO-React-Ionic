import { IonToast } from '@ionic/react';
import { useBookingNotifications } from '../../hooks/useBookingNotifications';

export function NotificationsWatcher() {
  const { alert, clearAlert } = useBookingNotifications();
  return <IonToast isOpen={alert !== ''} message={alert} duration={6000} position="top" onDidDismiss={clearAlert} />;
}
