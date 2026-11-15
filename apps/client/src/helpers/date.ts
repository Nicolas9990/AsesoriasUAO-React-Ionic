import type { Timestamp } from 'firebase/firestore';

const dateFormat = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota',
});

export function todayInBogota() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function dateTimeInBogota(date: string, time: string) {
  return new Date(`${date}T${time}:00-05:00`);
}

export function formatDate(value: Timestamp) {
  return dateFormat.format(value.toDate());
}
