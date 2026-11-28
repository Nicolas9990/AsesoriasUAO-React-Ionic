import { useMemo, useState } from 'react';
import { IonAlert, IonButton, IonLoading } from '@ionic/react';
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

type RequestFilter = 'todas' | Booking['estado'];

export function ProfessorRequestsPage() {
  const { user } = useAuth();
  const constraints = useMemo(() => user ? [where('profesorId', '==', user.uid), orderBy('creadaEn', 'desc'), limit(100)] : [], [user?.uid]);
  const { items: allItems, loading, error } = useLiveList<Booking>('reservas', constraints, toBooking);
  const items = allItems.filter((booking) => !booking.ocultaProfesor);
  const [busyId, setBusyId] = useState('');
  const [notice, setNotice] = useState('');
  const [rejecting, setRejecting] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<RequestFilter>('todas');
  const count = (state: Booking['estado']) => items.filter((booking) => booking.estado === state).length;
  const visible = filter === 'todas' ? items : items.filter((booking) => booking.estado === filter);
  const options: FilterOption<RequestFilter>[] = [
    { value: 'todas', label: 'Todas', count: items.length, color: 'dark' },
    { value: 'pendiente', label: 'Pendientes', count: count('pendiente'), color: 'warning' },
    { value: 'confirmada', label: 'Confirmadas', count: count('confirmada'), color: 'success' },
    { value: 'cancelada', label: 'Canceladas', count: count('cancelada'), color: 'danger' },
    { value: 'realizada', label: 'Realizadas', count: count('realizada'), color: 'primary' },
  ];
  async function update(booking: Booking, state: 'confirmada' | 'cancelada' | 'realizada', motivo?: string) {
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
        transaction.update(bookingRef, state === 'cancelada'
          ? { estado: state, motivo, actualizadaEn: serverTimestamp() }
          : { estado: state, actualizadaEn: serverTimestamp() });
      });
      setNotice(state === 'confirmada' ? 'Reserva confirmada.' : state === 'cancelada' ? 'Reserva cancelada.' : 'Asesoría marcada como realizada.');
    } catch (cause) { setNotice(errorMessage(cause)); }
    finally { setBusyId(''); }
  }
  return <PortalLayout title="Solicitudes de asesoría">
    <p className="portal-lede">Revisa las solicitudes de tus estudiantes y actualiza su estado.</p>
    <FilterTabs options={options} value={filter} onChange={setFilter} />
    {notice && <InlineState>{notice}</InlineState>}{loading && <IonLoading isOpen message="Cargando solicitudes…" />}
    {error && <InlineState danger>No se pudieron cargar las solicitudes: {error}</InlineState>}
    {!loading && !error && items.length === 0 && <InlineState>Aún no tienes solicitudes de asesoría.</InlineState>}
    {!loading && !error && items.length > 0 && visible.length === 0 && <InlineState>No hay solicitudes en esta categoría.</InlineState>}
    <div className="portal-grid">{visible.map((booking) => {
      const actions = <div className="booking-actions">
        {booking.estado === 'pendiente' && booking.inicio.toMillis() > Date.now() && <>
          <IonButton disabled={!!busyId} onClick={() => void update(booking, 'confirmada')}>{busyId === booking.id ? 'Guardando…' : 'Confirmar'}</IonButton>
          <IonButton fill="outline" color="danger" disabled={!!busyId} onClick={() => setRejecting(booking)}>Rechazar</IonButton>
        </>}
        {booking.estado === 'confirmada' && booking.inicio.toMillis() > Date.now() && <IonButton fill="outline" color="danger" disabled={!!busyId} onClick={() => setRejecting(booking)}>Cancelar</IonButton>}
        {booking.estado === 'confirmada' && booking.fin.toMillis() <= Date.now() && <IonButton disabled={!!busyId} onClick={() => void update(booking, 'realizada')}>Marcar realizada</IonButton>}
      </div>;
      return <BookingCard key={booking.id} booking={booking} role="profesor" actions={actions} onDismiss={() => void hideBooking(booking.id, 'profesor').catch((cause) => setNotice(errorMessage(cause)))} />;
    })}</div>
    <IonAlert
      isOpen={rejecting !== null}
      header="Justifica tu decisión"
      message="El estudiante verá este motivo."
      inputs={[{ name: 'motivo', type: 'textarea', placeholder: 'Escribe el motivo', attributes: { maxlength: 300 } }]}
      buttons={[
        { text: 'Volver', role: 'cancel' },
        {
          text: 'Enviar',
          handler: (data: { motivo?: string }) => {
            const motivo = String(data.motivo ?? '').trim();
            if (motivo.length < 3) { setNotice('Escribe una justificación de al menos 3 caracteres.'); return false; }
            if (rejecting) void update(rejecting, 'cancelada', motivo);
            return true;
          },
        },
      ]}
      onDidDismiss={() => setRejecting(null)}
    />
  </PortalLayout>;
}
