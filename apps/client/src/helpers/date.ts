// Funciones pequeñas para crear y mostrar fechas usando la hora de Colombia.
import type { Timestamp } from 'firebase/firestore';

const dateFormat = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota',
});

// Devuelve hoy con el formato que acepta un campo de fecha HTML: AAAA-MM-DD.
export function todayInBogota() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

// Convierte fecha y hora local de Colombia en un objeto Date.
export function dateTimeInBogota(date: string, time: string) {
  return new Date(`${date}T${time}:00-05:00`);
}

// Convierte el Timestamp de Firestore a una fecha legible en español.
export function formatDate(value: Timestamp) {
  return dateFormat.format(value.toDate());
}
