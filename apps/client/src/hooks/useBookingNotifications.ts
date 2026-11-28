import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { limit, orderBy, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { notificationId } from '../helpers/ids';
import type { Booking } from '../types/advisory';
import { toBooking, useLiveList } from './useAdvisoryData';
import { useHaptics } from './useHaptics';
import { useLocalNotifications } from './useLocalNotifications';

const REMINDER_MINUTES = 15;

export function useBookingNotifications() {
  const { user, profile } = useAuth();
  const field = profile?.rol === 'profesor' ? 'profesorId' : 'estudianteId';
  const constraints = useMemo(
    () => user ? [where(field, '==', user.uid), orderBy('creadaEn', 'desc'), limit(100)] : [],
    [user?.uid, field],
  );
  const { items } = useLiveList<Booking>('reservas', constraints, toBooking);
  const { vibrate } = useHaptics();
  const { requestPermission, notify, schedule, cancel } = useLocalNotifications();
  const [alert, setAlert] = useState('');
  const previous = useRef<Map<string, Booking['estado']> | null>(null);

  const clearAlert = useCallback(() => setAlert(''), []);

  useEffect(() => { void requestPermission(); }, [requestPermission]);

  useEffect(() => {
    const before = previous.current;
    previous.current = new Map(items.map((booking) => [booking.id, booking.estado] as const));
    if (!before || profile?.rol !== 'estudiante') return;
    items.forEach((booking) => {
      const old = before.get(booking.id);
      if (!old || old === booking.estado) return;
      let message = '';
      if (booking.estado === 'confirmada') message = `Tu asesoría de ${booking.asignaturaNombre} fue confirmada.`;
      else if (booking.estado === 'realizada') message = `Tu asesoría de ${booking.asignaturaNombre} fue marcada como realizada.`;
      else if (booking.estado === 'cancelada' && booking.motivo) message = `Tu solicitud de ${booking.asignaturaNombre} fue rechazada: ${booking.motivo}`;
      if (!message) return;
      setAlert(message);
      void vibrate();
      void notify({ id: notificationId(`${booking.id}-${booking.estado}`), title: 'Asesorías UAO', body: message });
    });
  }, [items, profile?.rol, vibrate, notify]);

  useEffect(() => {
    items.forEach((booking) => {
      const id = notificationId(booking.id);
      const at = new Date(booking.inicio.toMillis() - REMINDER_MINUTES * 60000);
      if (booking.estado === 'confirmada' && at.getTime() > Date.now()) {
        void schedule({
          id,
          title: 'Recordatorio de asesoría',
          body: `Tu asesoría de ${booking.asignaturaNombre} empieza en ${REMINDER_MINUTES} minutos.`,
          at,
        });
      } else if (booking.inicio.toMillis() > Date.now()) {
        void cancel(id);
      }
    });
  }, [items, schedule, cancel]);

  return { alert, clearAlert };
}
