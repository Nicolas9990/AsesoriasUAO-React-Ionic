import type { ReactNode } from 'react';
import { IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/react';
import type { UserRole } from '../../context/AuthContext';
import type { Booking } from '../../types/advisory';
import { formatDate } from '../../helpers/date';

function StatusBadge({ status }: { status: Booking['estado'] }) {
  const color = status === 'confirmada' || status === 'realizada' ? 'success' : status === 'cancelada' ? 'medium' : 'warning';
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <IonBadge color={color}>{label}</IonBadge>;
}

export function BookingCard({ booking, role, actions }: { booking: Booking; role: UserRole; actions?: ReactNode }) {
  const counterpart = role === 'estudiante' ? `Profesor: ${booking.profesorNombre}` : `Estudiante: ${booking.estudianteNombre}`;
  return <IonCard className="portal-card"><IonCardHeader>
    <IonCardSubtitle>{booking.asignaturaNombre}</IonCardSubtitle>
    <IonCardTitle>{formatDate(booking.inicio)}</IonCardTitle>
  </IonCardHeader><IonCardContent>
    <p>{counterpart}</p><p>Estado: <StatusBadge status={booking.estado} /></p>{actions}
  </IonCardContent></IonCard>;
}
