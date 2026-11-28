import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { UserRole } from '../context/AuthContext';

export async function hideBooking(bookingId: string, role: UserRole) {
  if (!db) return;
  await updateDoc(doc(db, 'reservas', bookingId), role === 'profesor' ? { ocultaProfesor: true } : { ocultaEstudiante: true });
}
