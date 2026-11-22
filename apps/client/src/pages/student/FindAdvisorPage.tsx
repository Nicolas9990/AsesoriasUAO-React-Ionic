import { useMemo, useState } from 'react';
import {
  IonButton, IonInput, IonItem, IonLoading,
} from '@ionic/react';
import {
  Timestamp, collection, doc, limit, orderBy, runTransaction,
  serverTimestamp, where, type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useLiveList, useSubjects, toSlot } from '../../hooks/useAdvisoryData';
import { dateTimeInBogota, todayInBogota } from '../../helpers/date';
import { errorMessage } from '../../helpers/errors';
import type { Slot } from '../../types/advisory';
import { InlineState } from '../../components/shared/InlineState';
import { PortalLayout } from '../../components/shared/PortalLayout';
import { SlotCard } from '../../components/advisory/SlotCard';
import { FilterTabs, type FilterOption } from '../../components/shared/FilterTabs';

const ALL_SUBJECTS = 'todas';

export function FindAdvisorPage() {
  const { user } = useAuth();
  const { subjects, loading: subjectsLoading, error: subjectsError } = useSubjects();
  const [subjectId, setSubjectId] = useState(ALL_SUBJECTS);
  const [fromDate, setFromDate] = useState(todayInBogota);
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState('');
  const start = useMemo(() => Timestamp.fromDate(dateTimeInBogota(fromDate, '00:00')), [fromDate]);
  const end = useMemo(() => Timestamp.fromDate(new Date(start.toMillis() + 7 * 24 * 60 * 60 * 1000)), [start]);
  const constraints = useMemo(() => {
    const filters: QueryConstraint[] = [
      where('activo', '==', true), where('reservado', '==', false),
      where('inicio', '>=', start), where('inicio', '<', end), orderBy('inicio'), limit(50),
    ];
    return filters;
  }, [start, end]);
  const { items: slots, loading, error } = useLiveList<Slot>('horarios', constraints, toSlot);
  const visibleSlots = subjectId === ALL_SUBJECTS ? slots : slots.filter((slot) => slot.asignaturaId === subjectId);
  const options: FilterOption<string>[] = [
    { value: ALL_SUBJECTS, label: 'Todas', count: slots.length, color: 'dark' },
    ...subjects.map((subject) => ({
      value: subject.id,
      label: subject.nombre,
      count: slots.filter((slot) => slot.asignaturaId === subject.id).length,
      color: 'primary',
    })),
  ];

  async function reserve(slot: Slot) {
    if (!db || !user) return;
    const firestore = db;
    const currentUser = user;
    setNotice('');
    setBusyId(slot.id);
    try {
      const slotRef = doc(firestore, 'horarios', slot.id);
      const profileRef = doc(firestore, 'perfilesPublicos', currentUser.uid);
      const bookingRef = doc(collection(firestore, 'reservas'));
      await runTransaction(firestore, async (transaction) => {
        const [slotSnapshot, profileSnapshot] = await Promise.all([
          transaction.get(slotRef), transaction.get(profileRef),
        ]);
        if (!slotSnapshot.exists() || !profileSnapshot.exists()) throw new Error('No se encontró el horario o tu perfil.');
        const current = slotSnapshot.data();
        if (current.activo !== true || current.reservado === true || current.inicio.toMillis() <= Date.now()) {
          throw new Error('El horario ya no está disponible. Actualiza los resultados.');
        }
        transaction.update(slotRef, { reservado: true, tieneHistorial: true, reservaId: bookingRef.id });
        transaction.set(bookingRef, {
          horarioId: slotRef.id,
          estudianteId: currentUser.uid,
          estudianteNombre: profileSnapshot.get('nombre'),
          profesorId: current.profesorId,
          profesorNombre: current.profesorNombre,
          asignaturaId: current.asignaturaId,
          asignaturaNombre: current.asignaturaNombre,
          inicio: current.inicio,
          fin: current.fin,
          estado: 'pendiente',
          creadaEn: serverTimestamp(),
          actualizadaEn: serverTimestamp(),
        });
      });
      setNotice('Tu solicitud se envió al profesor. Puedes consultar su estado en Mis reservas.');
    } catch (cause) { setNotice(errorMessage(cause)); }
    finally { setBusyId(''); }
  }

  return <PortalLayout title="Encuentra una asesoría">
    <p className="portal-lede">Filtra por asignatura y fecha. Los horarios disponibles se actualizan en tiempo real.</p>
    <section className="filter-card">
      <IonItem><IonInput label="Desde" labelPlacement="stacked" type="date" value={fromDate} min={todayInBogota()} onIonInput={(e) => setFromDate(String(e.detail.value ?? '').slice(0, 10))} /></IonItem>
    </section>
    <FilterTabs options={options} value={subjectId} onChange={setSubjectId} />
    {notice && <InlineState>{notice}</InlineState>}
    {subjectsLoading && <InlineState>Cargando asignaturas…</InlineState>}
    {subjectsError && <InlineState danger>No se pudieron cargar las asignaturas: {subjectsError}</InlineState>}
    {loading && <IonLoading isOpen message="Buscando horarios…" />}
    {error && <InlineState danger>No se pudieron cargar horarios. Verifica índices y permisos de Firestore. {error}</InlineState>}
    {!loading && !error && visibleSlots.length === 0 && <InlineState>No hay horarios disponibles para los filtros seleccionados.</InlineState>}
    <div className="portal-grid">{visibleSlots.map((slot) => <SlotCard key={slot.id} slot={slot} action={<IonButton expand="block" disabled={!!busyId} onClick={() => void reserve(slot)}>{busyId === slot.id ? 'Enviando…' : 'Solicitar asesoría'}</IonButton>} />)}</div>
  </PortalLayout>;
}
