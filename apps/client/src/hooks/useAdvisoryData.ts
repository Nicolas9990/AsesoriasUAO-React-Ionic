// Hooks y convertidores para leer asignaturas, horarios y reservas desde Firestore.
import { useEffect, useState } from 'react';
import type { Timestamp } from 'firebase/firestore';
import {
  collection, onSnapshot, orderBy, query, where,
  type DocumentData, type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Booking, Slot, Subject } from '../types/advisory';
import { errorMessage } from '../helpers/errors';

// Escucha en tiempo real las materias activas del catálogo.
export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Al abrir la pantalla, empieza a escuchar materias y limpia la escucha al salir.
  useEffect(() => {
    if (!db) return;
    const subjectQuery = query(
      collection(db, 'asignaturas'),
      where('activa', '==', true),
      orderBy('nombre'),
    );
    return onSnapshot(subjectQuery, (snapshot) => {
      setSubjects(snapshot.docs.map((item) => ({ id: item.id, nombre: String(item.get('nombre') ?? '') })));
      setError('');
      setLoading(false);
    }, (cause) => {
      setError(errorMessage(cause));
      setLoading(false);
    });
  }, []);
  return { subjects, loading, error };
}

// Hook reutilizable: ejecuta una consulta de Firestore y mantiene su lista actualizada.
export function useLiveList<T>(path: string, constraints: QueryConstraint[], mapper: (id: string, data: DocumentData) => T) {
  // items guarda la lista; loading y error informan a la pantalla qué está pasando.
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Se vuelve a consultar si cambia la colección o alguno de sus filtros.
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, path), ...constraints);
    // onSnapshot mantiene la lista sincronizada sin volver a consultar manualmente.
    return onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map((item) => mapper(item.id, item.data())));
      setError('');
      setLoading(false);
    }, (cause) => {
      setError(errorMessage(cause));
      setLoading(false);
    });
  // La página memoriza los filtros para no reiniciar la escucha en cada render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, constraints]);
  // La página recibe los datos y puede mostrar carga, error o resultados.
  return { items, loading, error };
}

// Convierte un documento sin tipo de Firestore en un objeto horario que usa React.
export function toSlot(id: string, data: DocumentData): Slot {
  return {
    id,
    profesorId: String(data.profesorId ?? ''),
    profesorNombre: String(data.profesorNombre ?? 'Profesor'),
    asignaturaId: String(data.asignaturaId ?? ''),
    asignaturaNombre: String(data.asignaturaNombre ?? 'Asignatura'),
    inicio: data.inicio as Timestamp,
    fin: data.fin as Timestamp,
    reservado: data.reservado === true,
    activo: data.activo === true,
    tieneHistorial: data.tieneHistorial === true,
  };
}

// Convierte un documento de Firestore al formato de reserva de la app.
export function toBooking(id: string, data: DocumentData): Booking {
  return {
    id,
    horarioId: String(data.horarioId ?? ''),
    estudianteId: String(data.estudianteId ?? ''),
    estudianteNombre: String(data.estudianteNombre ?? 'Estudiante'),
    profesorId: String(data.profesorId ?? ''),
    profesorNombre: String(data.profesorNombre ?? 'Profesor'),
    asignaturaNombre: String(data.asignaturaNombre ?? 'Asignatura'),
    inicio: data.inicio as Timestamp,
    fin: data.fin as Timestamp,
    estado: data.estado,
  };
}
