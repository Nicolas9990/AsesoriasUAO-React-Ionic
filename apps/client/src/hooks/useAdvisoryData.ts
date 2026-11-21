import { useEffect, useState } from 'react';
import type { Timestamp } from 'firebase/firestore';
import {
  collection, onSnapshot, orderBy, query, where,
  type DocumentData, type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Booking, Slot, Subject } from '../types/advisory';
import { errorMessage } from '../helpers/errors';

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

export function useLiveList<T>(path: string, constraints: QueryConstraint[], mapper: (id: string, data: DocumentData) => T) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, path), ...constraints);
    return onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map((item) => mapper(item.id, item.data())));
      setError('');
      setLoading(false);
    }, (cause) => {
      setError(errorMessage(cause));
      setLoading(false);
    });
  // Callers memoize constraints; live snapshots keep availability and booking states current.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, constraints]);
  return { items, loading, error };
}

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
