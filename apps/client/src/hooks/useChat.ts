import { useEffect, useState } from 'react';
import {
  addDoc, collection, doc, limit, onSnapshot, orderBy, query, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { errorMessage } from '../helpers/errors';
import type { Booking, ChatMessage } from '../types/advisory';
import { toBooking } from './useAdvisoryData';

export function useBooking(reservaId: string) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!db || !reservaId) return;
    return onSnapshot(doc(db, 'reservas', reservaId), (snapshot) => {
      setBooking(snapshot.exists() ? toBooking(snapshot.id, snapshot.data()) : null);
      setError('');
      setLoading(false);
    }, (cause) => {
      setError(errorMessage(cause));
      setLoading(false);
    });
  }, [reservaId]);
  return { booking, loading, error };
}

export function useChatMessages(reservaId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!db || !reservaId) return;
    const messagesQuery = query(collection(db, 'reservas', reservaId, 'mensajes'), orderBy('creadaEn', 'asc'), limit(200));
    return onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map((item) => ({
        id: item.id,
        autorId: String(item.get('autorId') ?? ''),
        texto: String(item.get('texto') ?? ''),
        imagen: item.get('imagen') ? String(item.get('imagen')) : undefined,
      })));
      setError('');
    }, (cause) => setError(errorMessage(cause)));
  }, [reservaId]);

  async function sendMessage(autorId: string, texto: string, imagen?: string) {
    if (!db) return;
    await addDoc(collection(db, 'reservas', reservaId, 'mensajes'), {
      autorId,
      texto,
      ...(imagen ? { imagen } : {}),
      creadaEn: serverTimestamp(),
    });
  }

  return { messages, error, sendMessage };
}
