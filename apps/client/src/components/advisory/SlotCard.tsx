import type { ReactNode } from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/react';
import { formatDate } from '../../helpers/date';
import type { Slot } from '../../types/advisory';

export function SlotCard({ slot, action }: { slot: Slot; action: ReactNode }) {
  return <IonCard className="portal-card"><IonCardHeader>
    <IonCardSubtitle>{slot.asignaturaNombre}</IonCardSubtitle>
    <IonCardTitle>{formatDate(slot.inicio)}</IonCardTitle>
  </IonCardHeader><IonCardContent>
    <p>Profesor: {slot.profesorNombre}</p>
    <p>Duración: {Math.round((slot.fin.toMillis() - slot.inicio.toMillis()) / 60000)} minutos</p>
    {action}
  </IonCardContent></IonCard>;
}
