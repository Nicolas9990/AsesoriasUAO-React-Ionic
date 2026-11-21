import type { Timestamp } from 'firebase/firestore';

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
