// Forma de los datos de Firestore para materias, horarios y reservas.
import type { Timestamp } from 'firebase/firestore';

// Subject representa una materia, Slot un horario y Booking una reserva.
export type Subject = { id: string; nombre: string };

export type Slot = {
  id: string;
  profesorId: string;
  profesorNombre: string;
  asignaturaId: string;
  asignaturaNombre: string;
  inicio: Timestamp;
  fin: Timestamp;
  reservado: boolean;
  activo: boolean;
  tieneHistorial?: boolean;
};

export type Booking = {
  id: string;
  horarioId: string;
  estudianteId: string;
  estudianteNombre: string;
  profesorId: string;
  profesorNombre: string;
  asignaturaNombre: string;
  inicio: Timestamp;
  fin: Timestamp;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'realizada';
};
