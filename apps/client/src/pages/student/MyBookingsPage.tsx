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

export function MyBookingsPage() {
  const { user } = useAuth();
  const constraints = useMemo(() => user ? [where('estudianteId', '==', user.uid), orderBy('creadaEn', 'desc'), limit(100)] : [], [user?.uid]);
  const { items, loading, error } = useLiveList<Booking>('reservas', constraints, toBooking);
  const [busyId, setBusyId] = useState('');
  const [notice, setNotice] = useState('');
  async function cancel(booking: Booking) {
    if (!db || !user) return;
    const firestore = db;
    const currentUser = user;
    setBusyId(booking.id); setNotice('');
    try {
      const bookingRef = doc(firestore, 'reservas', booking.id);
      const slotRef = doc(firestore, 'horarios', booking.horarioId);
      await runTransaction(firestore, async (transaction) => {
        const [bookingSnapshot, slotSnapshot] = await Promise.all([
          transaction.get(bookingRef), transaction.get(slotRef),
        ]);
        if (!bookingSnapshot.exists() || !slotSnapshot.exists()) throw new Error('No se encontró la reserva o el horario.');
        const current = bookingSnapshot.data();
        if (current.estudianteId !== currentUser.uid || !['pendiente', 'confirmada'].includes(current.estado)
          || current.inicio.toMillis() <= Date.now()) throw new Error('Ya no puedes cancelar esta reserva.');
        if (slotSnapshot.get('reservaId') !== bookingRef.id) throw new Error('El horario ya no corresponde a esta reserva.');
        transaction.update(bookingRef, { estado: 'cancelada', actualizadaEn: serverTimestamp() });
        transaction.update(slotRef, { reservado: false, reservaId: null });
      });
      setNotice('La asesoría fue cancelada.');
    } catch (cause) { setNotice(errorMessage(cause)); }
    finally { setBusyId(''); }
  }
  return <PortalLayout title="Mis reservas">
    <p className="portal-lede">Consulta las solicitudes y el estado de tus próximas asesorías.</p>
    {notice && <InlineState>{notice}</InlineState>}{loading && <IonLoading isOpen message="Cargando reservas…" />}
    {error && <InlineState danger>No se pudieron cargar tus reservas: {error}</InlineState>}
    {!loading && !error && items.length === 0 && <InlineState>Aún no tienes reservas. Busca un horario para solicitar tu primera asesoría.</InlineState>}
    <div className="portal-grid">{items.map((booking) => <BookingCard key={booking.id} booking={booking} role="estudiante" actions={booking.estado !== 'cancelada' && booking.estado !== 'realizada' && booking.inicio.toMillis() > Date.now() ? <IonButton fill="outline" color="danger" disabled={!!busyId} onClick={() => void cancel(booking)}>{busyId === booking.id ? 'Cancelando…' : 'Cancelar solicitud'}</IonButton> : null} />)}</div>
  </PortalLayout>;
}
