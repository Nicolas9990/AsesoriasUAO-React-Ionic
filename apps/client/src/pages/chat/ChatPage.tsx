import { useEffect, useRef, useState, type FormEvent } from 'react';
import { IonButton, IonInput, IonLoading } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooking, useChatMessages } from '../../hooks/useChat';
import { useCamera } from '../../hooks/useCamera';
import { errorMessage } from '../../helpers/errors';
import { formatDate } from '../../helpers/date';
import { InlineState } from '../../components/shared/InlineState';
import { PortalLayout } from '../../components/shared/PortalLayout';

const MAX_IMAGE_LENGTH = 700000;

export function ChatPage() {
  const { reservaId = '' } = useParams();
  const { user, profile } = useAuth();
  const { booking, loading, error: bookingError } = useBooking(reservaId);
  const { messages, error: messagesError, sendMessage } = useChatMessages(reservaId);
  const { takePhoto } = useCamera();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const backPath = profile?.rol === 'profesor' ? '/solicitudes' : '/reservas';
  const active = booking?.estado === 'pendiente' || booking?.estado === 'confirmada';
  const counterpart = booking && user
    ? (user.uid === booking.estudianteId ? `Profesor: ${booking.profesorNombre}` : `Estudiante: ${booking.estudianteNombre}`)
    : '';

  async function send(content: string, image?: string) {
    if (!user) return;
    setSending(true); setNotice('');
    try {
      await sendMessage(user.uid, content, image);
      setText('');
    } catch (cause) { setNotice(errorMessage(cause)); }
    finally { setSending(false); }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const content = text.trim();
    if (!content || sending) return;
    void send(content);
  }

  async function onPhoto() {
    const photo = await takePhoto();
    if (!photo) return;
    if (photo.length > MAX_IMAGE_LENGTH) { setNotice('La foto es muy pesada, intenta con otra.'); return; }
    void send('', photo);
  }

  return <PortalLayout title="Chat de la asesoría">
    <IonButton fill="clear" routerLink={backPath} routerDirection="back">Volver</IonButton>
    {loading && <IonLoading isOpen message="Cargando chat…" />}
    {bookingError && <InlineState danger>No se pudo cargar la reserva: {bookingError}</InlineState>}
    {!loading && !bookingError && !booking && <InlineState>No se encontró la reserva.</InlineState>}
    {booking && <>
      <p className="portal-lede">{booking.asignaturaNombre} · {formatDate(booking.inicio)} · {counterpart}</p>
      {messagesError && <InlineState danger>No se pudieron cargar los mensajes: {messagesError}</InlineState>}
      <div className="chat-box">
        {messages.length === 0 && <InlineState>Aún no hay mensajes. Escribe el primero.</InlineState>}
        {messages.map((message) => <div key={message.id} className={message.autorId === user?.uid ? 'chat-message chat-mine' : 'chat-message'}>
          {message.imagen && <img className="chat-image" src={message.imagen} alt="Foto enviada" />}
          {message.texto && <p>{message.texto}</p>}
        </div>)}
        <div ref={endRef} />
      </div>
      {notice && <InlineState danger>{notice}</InlineState>}
      {active
        ? <form className="chat-form" onSubmit={onSubmit}>
          <IonInput className="chat-input" value={text} placeholder="Escribe un mensaje" maxlength={1000} onIonInput={(event) => setText(String(event.detail.value ?? ''))} />
          <IonButton fill="outline" disabled={sending} onClick={() => void onPhoto()}>Foto</IonButton>
          <IonButton type="submit" disabled={sending || !text.trim()}>Enviar</IonButton>
        </form>
        : <InlineState>Esta asesoría ya no está activa, el chat quedó solo de lectura.</InlineState>}
    </>}
  </PortalLayout>;
}
