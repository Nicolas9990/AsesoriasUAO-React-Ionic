import { useMemo, useState } from 'react';
import { IonButton, IonLoading } from '@ionic/react';
import { doc, limit, orderBy, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { useLiveList, toBooking } from '../../hooks/useAdvisoryData';
import { errorMessage } from '../../helpers/errors';
import type { Booking } from '../../types/advisory';
import { BookingCard } from '../../components/advisory/BookingCard';
import { InlineState } from '../../components/shared/InlineState';
import { PortalLayout } from '../../components/shared/PortalLayout';

export function ProfessorRequestsPage() {
  const { user } = useAuth();
  const constraints = useMemo(() => user ? [where('profesorId', '==', user.uid), orderBy('creadaEn', 'desc'), limit(100)] : [], [user?.uid]);
  const { items, loading, error } = useLiveList<Booking>('reservas', constraints, toBooking);
  const [busyId, setBusyId] = useState('');
  const [notice, setNotice] = useState('');
  async function update(booking: Booking, state: 'confirmada' | 'cancelada' | 'realizada') {
    if (!db || !user) return;
    const firestore = db;
    const currentUser = user;
    setBusyId(booking.id); setNotice('');
    try {
      const bookingRef = doc(firestore, 'reservas', booking.id);
      await runTransaction(firestore, async (transaction) => {
        const snapshot = await transaction.get(bookingRef);
        if (!snapshot.exists()) throw new Error('No se encontró la reserva.');
        const current = snapshot.data();
        const ownsAsProfessor = current.profesorId === currentUser.uid;
        const ownsAsStudent = current.estudianteId === currentUser.uid;
        const now = Date.now();
        const allowed = state === 'confirmada'
          ? ownsAsProfessor && current.estado === 'pendiente' && current.inicio.toMillis() > now
          : state === 'cancelada'
            ? (ownsAsProfessor || ownsAsStudent) && ['pendiente', 'confirmada'].includes(current.estado) && current.inicio.toMillis() > now
            : ownsAsProfessor && current.estado === 'confirmada' && current.fin.toMillis() <= now;
        if (!allowed) throw new Error('La acción ya no está permitida para esta reserva.');
        if (state === 'cancelada') {
          const slotRef = doc(firestore, 'horarios', String(current.horarioId));
          const slot = await transaction.get(slotRef);
          if (!slot.exists() || slot.get('reservaId') !== bookingRef.id) throw new Error('El horario ya no corresponde a esta reserva.');
          transaction.update(slotRef, { reservado: false, reservaId: null });
        }
        transaction.update(bookingRef, { estado: state, actualizadaEn: serverTimestamp() });
      });
      setNotice(state === 'confirmada' ? 'Reserva confirmada.' : state === 'cancelada' ? 'Reserva cancelada.' : 'Asesoría marcada como realizada.');
    } catch (cause) { setNotice(errorMessage(cause)); }
    finally { setBusyId(''); }
  }
  return <PortalLayout title="Solicitudes de asesoría">
    <p className="portal-lede">Revisa las solicitudes de tus estudiantes y actualiza su estado.</p>
    {notice && <InlineState>{notice}</InlineState>}{loading && <IonLoading isOpen message="Cargando solicitudes…" />}
    {error && <InlineState danger>No se pudieron cargar las solicitudes: {error}</InlineState>}
    {!loading && !error && items.length === 0 && <InlineState>Aún no tienes solicitudes de asesoría.</InlineState>}
    <div className="portal-grid">{items.map((booking) => {
      const actions = <div className="booking-actions">
        {booking.estado === 'pendiente' && booking.inicio.toMillis() > Date.now() && <>
          <IonButton disabled={!!busyId} onClick={() => void update(booking, 'confirmada')}>{busyId === booking.id ? 'Guardando…' : 'Confirmar'}</IonButton>
          <IonButton fill="outline" color="danger" disabled={!!busyId} onClick={() => void update(booking, 'cancelada')}>Rechazar / cancelar</IonButton>
        </>}
        {booking.estado === 'confirmada' && booking.inicio.toMillis() > Date.now() && <IonButton fill="outline" color="danger" disabled={!!busyId} onClick={() => void update(booking, 'cancelada')}>Cancelar</IonButton>}
        {booking.estado === 'confirmada' && booking.fin.toMillis() <= Date.now() && <IonButton disabled={!!busyId} onClick={() => void update(booking, 'realizada')}>Marcar realizada</IonButton>}
      </div>;
      return <BookingCard key={booking.id} booking={booking} role="profesor" actions={actions} />;
    })}</div>
  </PortalLayout>;
}
