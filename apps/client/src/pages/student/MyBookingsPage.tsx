import { useMemo, useState } from 'react';
import { IonButton, IonLoading } from '@ionic/react';
import { doc, limit, orderBy, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useLiveList, toBooking } from '../../hooks/useAdvisoryData';
import { errorMessage } from '../../helpers/errors';
import { hideBooking } from '../../helpers/bookings';
import type { Booking } from '../../types/advisory';
import { BookingCard } from '../../components/advisory/BookingCard';
import { InlineState } from '../../components/shared/InlineState';
import { PortalLayout } from '../../components/shared/PortalLayout';
import { FilterTabs, type FilterOption } from '../../components/shared/FilterTabs';

type BookingFilter = 'todas' | Booking['estado'];

export function MyBookingsPage() {
  const { user } = useAuth();
  const constraints = useMemo(() => user ? [where('estudianteId', '==', user.uid), orderBy('creadaEn', 'desc'), limit(100)] : [], [user?.uid]);
  const { items: allItems, loading, error } = useLiveList<Booking>('reservas', constraints, toBooking);
  const items = allItems.filter((booking) => !booking.ocultaEstudiante);
  const [busyId, setBusyId] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState<BookingFilter>('todas');
  const count = (state: Booking['estado']) => items.filter((booking) => booking.estado === state).length;
  const visible = filter === 'todas' ? items : items.filter((booking) => booking.estado === filter);
  const options: FilterOption<BookingFilter>[] = [
    { value: 'todas', label: 'Todas', count: items.length, color: 'dark' },
    { value: 'pendiente', label: 'Pendientes', count: count('pendiente'), color: 'warning' },
    { value: 'confirmada', label: 'Confirmadas', count: count('confirmada'), color: 'success' },
    { value: 'cancelada', label: 'Canceladas', count: count('cancelada'), color: 'danger' },
    { value: 'realizada', label: 'Realizadas', count: count('realizada'), color: 'primary' },
  ];
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
    <FilterTabs options={options} value={filter} onChange={setFilter} />
    {notice && <InlineState>{notice}</InlineState>}{loading && <IonLoading isOpen message="Cargando reservas…" />}
    {error && <InlineState danger>No se pudieron cargar tus reservas: {error}</InlineState>}
    {!loading && !error && items.length === 0 && <InlineState>Aún no tienes reservas. Busca un horario para solicitar tu primera asesoría.</InlineState>}
    {!loading && !error && items.length > 0 && visible.length === 0 && <InlineState>No hay reservas en esta categoría.</InlineState>}
    <div className="portal-grid">{visible.map((booking) => <BookingCard key={booking.id} booking={booking} role="estudiante" onDismiss={() => void hideBooking(booking.id, 'estudiante').catch((cause) => setNotice(errorMessage(cause)))} actions={booking.estado !== 'cancelada' && booking.estado !== 'realizada' && booking.inicio.toMillis() > Date.now() ? <IonButton fill="outline" color="danger" disabled={!!busyId} onClick={() => void cancel(booking)}>{busyId === booking.id ? 'Cancelando…' : 'Cancelar solicitud'}</IonButton> : null} />)}</div>
  </PortalLayout>;
}
