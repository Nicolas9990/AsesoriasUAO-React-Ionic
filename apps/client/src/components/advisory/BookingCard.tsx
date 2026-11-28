import type { ReactNode } from 'react';
import { IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import type { UserRole } from '../../context/AuthContext';
import type { Booking } from '../../types/advisory';
import { formatDate } from '../../helpers/date';

function StatusBadge({ status }: { status: Booking['estado'] }) {
  const color = status === 'confirmada' || status === 'realizada' ? 'success' : status === 'cancelada' ? 'medium' : 'warning';
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <IonBadge color={color}>{label}</IonBadge>;
}

export function BookingCard({ booking, role, actions, onDismiss }: { booking: Booking; role: UserRole; actions?: ReactNode; onDismiss?: () => void }) {
  const counterpart = role === 'estudiante' ? `Profesor: ${booking.profesorNombre}` : `Estudiante: ${booking.estudianteNombre}`;
  return <IonCard className="portal-card">
    {booking.estado === 'cancelada' && onDismiss && <IonButton className="booking-dismiss" fill="clear" color="medium" aria-label="Quitar de la lista" onClick={onDismiss}><IonIcon slot="icon-only" icon={closeOutline} /></IonButton>}
    <IonCardHeader>
    <IonCardSubtitle>{booking.asignaturaNombre}</IonCardSubtitle>
    <IonCardTitle>{formatDate(booking.inicio)}</IonCardTitle>
  </IonCardHeader><IonCardContent>
    <p>{counterpart}</p>
    {booking.modalidad && <p>Modalidad: {booking.modalidad === 'virtual' ? 'Virtual' : 'Presencial'}</p>}
    {booking.lugar && <p>{booking.modalidad === 'virtual' ? 'Enlace o plataforma' : 'Lugar'}: {booking.lugar}</p>}
    <p>Estado: <StatusBadge status={booking.estado} /></p>
    {booking.estado === 'cancelada' && booking.motivo && <p className="booking-reason"><strong>Justificación:</strong> {booking.motivo}</p>}
    <IonButton fill="outline" routerLink={`/chat/${booking.id}`}>Chat</IonButton>
    {actions}
  </IonCardContent></IonCard>;
}
