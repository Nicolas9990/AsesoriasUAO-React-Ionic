import { useEffect, useMemo, useState } from 'react';
import {
  IonBadge, IonButton, IonInput, IonItem, IonLoading, IonSelect, IonSelectOption,
} from '@ionic/react';
import {
  Timestamp, collection, doc, getDoc, getDocs, limit, orderBy,
  query, runTransaction, serverTimestamp, where, writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useLiveList, toSlot } from '../../hooks/useAdvisoryData';
import { dateTimeInBogota, todayInBogota } from '../../helpers/date';
import { errorMessage } from '../../helpers/errors';
import { subjectSlug } from '../../helpers/subjects';
import type { Modality, Slot, Subject } from '../../types/advisory';
import { InlineState } from '../../components/shared/InlineState';
import { PortalLayout } from '../../components/shared/PortalLayout';
import { SlotCard } from '../../components/advisory/SlotCard';
import { FilterTabs, type FilterOption } from '../../components/shared/FilterTabs';

type ScheduleFilter = 'todos' | 'disponibles' | 'reservados';

export function ManageSchedulesPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [modality, setModality] = useState<Modality>('presencial');
  const [place, setPlace] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);
  const [subjectsVersion, setSubjectsVersion] = useState(0);

  useEffect(() => {
    if (!db || !user) return;
    let active = true;
    async function loadAssignedSubjects() {
      try {
        const assignmentSnapshot = await getDocs(collection(db!, 'perfiles', user!.uid, 'asignaturas'));
        const assigned = await Promise.all(assignmentSnapshot.docs.map(async (assignment) => {
          const subject = await getDoc(doc(db!, 'asignaturas', assignment.id));
          return subject.exists() && subject.get('activa') === true
            ? { id: subject.id, nombre: String(subject.get('nombre') ?? '') }
            : null;
        }));
        if (active) setSubjects(assigned.filter((item): item is Subject => item !== null));
      } catch (cause) { if (active) setSubjectsError(errorMessage(cause)); }
      finally { if (active) setSubjectsLoading(false); }
    }
    void loadAssignedSubjects();
    return () => { active = false; };
  }, [user?.uid, subjectsVersion]);

  const constraints = useMemo(() => user ? [where('profesorId', '==', user.uid), where('inicio', '>=', Timestamp.now()), orderBy('inicio'), limit(100)] : [], [user?.uid]);
  const { items: slots, loading, error } = useLiveList<Slot>('horarios', constraints, toSlot);
  const [filter, setFilter] = useState<ScheduleFilter>('todos');
  const reservedCount = slots.filter((slot) => slot.reservado).length;
  const visibleSlots = filter === 'todos' ? slots : slots.filter((slot) => slot.reservado === (filter === 'reservados'));
  const options: FilterOption<ScheduleFilter>[] = [
    { value: 'todos', label: 'Todos', count: slots.length, color: 'dark' },
    { value: 'disponibles', label: 'Disponibles', count: slots.length - reservedCount, color: 'success' },
    { value: 'reservados', label: 'Reservados', count: reservedCount, color: 'warning' },
  ];

  async function addSubject() {
    if (!db || !user) return;
    const firestore = db;
    const currentUser = user;
    const name = newSubject.trim().replace(/\s+/g, ' ');
    const slug = subjectSlug(name);
    if (name.length < 3 || name.length > 100 || !slug) { setNotice('Escribe el nombre de la materia (entre 3 y 100 caracteres).'); return; }
    setAddingSubject(true); setNotice('');
    try {
      const catalog = await getDocs(query(collection(firestore, 'asignaturas'), where('activa', '==', true)));
      const match = catalog.docs.find((item) => item.id === slug || subjectSlug(String(item.get('nombre') ?? '')) === slug);
      const targetId = match?.id ?? slug;
      if (subjects.some((item) => item.id === targetId)) { setNotice('Esa materia ya está en tu perfil.'); return; }
      const batch = writeBatch(firestore);
      if (!match) {
        batch.set(doc(firestore, 'asignaturas', targetId), {
          nombre: name, activa: true, creadaPor: currentUser.uid, creadoEn: serverTimestamp(),
        });
      }
      batch.set(doc(firestore, 'perfiles', currentUser.uid, 'asignaturas', targetId), { asignadaEn: serverTimestamp() });
      await batch.commit();
      setNotice(match ? 'La materia ya existía y se agregó a tu perfil.' : 'Materia creada y agregada a tu perfil.');
      setNewSubject('');
      setSubjectsVersion((value) => value + 1);
    } catch (cause) { setNotice(errorMessage(cause)); }
    finally { setAddingSubject(false); }
  }

  async function createSchedule() {
    if (!db || !user || !subjectId || !date || !time) { setNotice('Selecciona una asignatura, fecha y hora.'); return; }
    const placeText = place.trim();
    if (placeText.length < 1 || placeText.length > 120) { setNotice(modality === 'virtual' ? 'Indica el enlace o la plataforma de la asesoría.' : 'Indica el lugar de la asesoría.'); return; }
    const firestore = db;
    const currentUser = user;
    const start = dateTimeInBogota(date, time);
    const finish = new Date(start.getTime() + duration * 60000);
    if (Number.isNaN(start.getTime()) || finish.toDateString() !== start.toDateString() || start.getTime() <= Date.now()) {
      setNotice('El horario debe ser futuro y terminar el mismo día.'); return;
    }
    setBusy(true); setNotice('');
    try {
      const startTimestamp = Timestamp.fromDate(start);
      const endTimestamp = Timestamp.fromDate(finish);
      const profileRef = doc(firestore, 'perfiles', currentUser.uid);
      const publicProfileRef = doc(firestore, 'perfilesPublicos', currentUser.uid);
      const subjectRef = doc(firestore, 'asignaturas', subjectId);
      const assignmentRef = doc(firestore, 'perfiles', currentUser.uid, 'asignaturas', subjectId);
      const lockRef = doc(firestore, 'perfiles', currentUser.uid, 'locks', 'horarios');
      const slotRef = doc(collection(firestore, 'horarios'));
      await runTransaction(firestore, async (transaction) => {
        const [profile, publicProfile, subject, assignment, lock] = await Promise.all([
          transaction.get(profileRef), transaction.get(publicProfileRef), transaction.get(subjectRef),
          transaction.get(assignmentRef), transaction.get(lockRef),
        ]);
        if (!profile.exists() || profile.get('rol') !== 'profesor' || !publicProfile.exists()) {
          throw new Error('Tu cuenta no está habilitada como profesor.');
        }
        if (!subject.exists() || subject.get('activa') !== true || !assignment.exists()) {
          throw new Error('La asignatura no está activa o no está asignada a tu perfil.');
        }
        const storedIntervals = (lock.exists() ? lock.get('intervalos') : []) as Array<{
          horarioId: string; inicio: Timestamp; fin: Timestamp;
        }>;
        if (!Array.isArray(storedIntervals)) throw new Error('El calendario del profesor no tiene un formato válido.');
        const intervals = storedIntervals.filter((item) => item.fin instanceof Timestamp
          && item.fin.toMillis() > Timestamp.now().toMillis());
        const overlaps = intervals.some((item) => item.inicio instanceof Timestamp
          && startTimestamp.toMillis() < item.fin.toMillis() && endTimestamp.toMillis() > item.inicio.toMillis());
        if (overlaps) throw new Error('El horario se cruza con otra franja publicada.');
        transaction.set(lockRef, {
          actualizadoEn: serverTimestamp(),
          intervalos: [...intervals, { horarioId: slotRef.id, inicio: startTimestamp, fin: endTimestamp }],
        });
        transaction.set(slotRef, {
          profesorId: currentUser.uid,
          profesorNombre: publicProfile.get('nombre'),
          asignaturaId: subjectId,
          asignaturaNombre: subject.get('nombre'),
          inicio: startTimestamp,
          fin: endTimestamp,
          reservado: false,
          tieneHistorial: false,
          modalidad: modality,
          lugar: placeText,
          activo: true,
          creadoEn: serverTimestamp(),
        });
      });
      setNotice('Horario publicado. Ya aparece en la búsqueda de asesorías.');
      setDate(''); setTime('');
    } catch (cause) { setNotice(errorMessage(cause)); }
    finally { setBusy(false); }
  }

  async function removeSchedule(slot: Slot) {
    if (!db || !user) return;
    const firestore = db;
    const currentUser = user;
    setBusy(true); setNotice('');
    try {
      const slotRef = doc(firestore, 'horarios', slot.id);
      const lockRef = doc(firestore, 'perfiles', currentUser.uid, 'locks', 'horarios');
      await runTransaction(firestore, async (transaction) => {
        const snapshot = await transaction.get(slotRef);
        if (!snapshot.exists() || snapshot.get('profesorId') !== currentUser.uid || snapshot.get('reservado') === true
          || snapshot.get('tieneHistorial') === true || snapshot.get('inicio').toMillis() <= Date.now()) {
          throw new Error('Solo puedes eliminar horarios futuros sin reservas previas y de tu propiedad.');
        }
        const lock = await transaction.get(lockRef);
        const intervals = (lock.exists() ? lock.get('intervalos') : []) as Array<{ horarioId: string }>;
        if (!Array.isArray(intervals) || !intervals.some((item) => item.horarioId === slot.id)) {
          throw new Error('No se encontró el horario en el calendario del profesor.');
        }
        transaction.set(lockRef, {
          actualizadoEn: serverTimestamp(),
          intervalos: intervals.filter((item) => item.horarioId !== slot.id),
        });
        transaction.delete(slotRef);
      });
      setNotice('Horario eliminado.');
    } catch (cause) { setNotice(errorMessage(cause)); }
    finally { setBusy(false); }
  }

  return <PortalLayout title="Mis horarios">
    <p className="portal-lede">Publica los espacios disponibles para las asignaturas que tienes asignadas.</p>
    <section className="schedule-form">
      <h2>Mis materias</h2>
      <div className="filter-card">
        <IonItem><IonInput label="Nueva materia" labelPlacement="stacked" placeholder="Ej. Cálculo diferencial" maxlength={100} value={newSubject} onIonInput={(e) => setNewSubject(String(e.detail.value ?? ''))} /></IonItem>
      </div>
      <IonButton className="form-submit" disabled={addingSubject || newSubject.trim().length < 3} onClick={() => void addSubject()}>{addingSubject ? 'Agregando…' : 'Agregar materia'}</IonButton>
    </section>
    <section className="schedule-form">
      <h2>Publicar un horario</h2>
      {subjectsLoading ? <InlineState>Cargando tus asignaturas…</InlineState> : subjects.length === 0 ? <InlineState>Aún no tienes materias. Agrega una arriba para poder publicar horarios.</InlineState> : <>
        <div className="filter-card">
          <IonItem><IonSelect label="Asignatura" labelPlacement="stacked" value={subjectId} onIonChange={(e) => setSubjectId(e.detail.value ?? '')} interface="popover">
            {subjects.map((subject) => <IonSelectOption key={subject.id} value={subject.id}>{subject.nombre}</IonSelectOption>)}
          </IonSelect></IonItem>
          <IonItem><IonInput label="Fecha" labelPlacement="stacked" type="date" min={todayInBogota()} value={date} onIonInput={(e) => setDate(String(e.detail.value ?? '').slice(0, 10))} /></IonItem>
          <IonItem><IonInput label="Hora de inicio" labelPlacement="stacked" type="time" value={time} onIonInput={(e) => setTime(String(e.detail.value ?? '').slice(0, 5))} /></IonItem>
          <IonItem><IonSelect label="Duración" labelPlacement="stacked" value={duration} onIonChange={(e) => setDuration(Number(e.detail.value))} interface="popover">
            {[30, 45, 60, 90, 120].map((minutes) => <IonSelectOption key={minutes} value={minutes}>{minutes} minutos</IonSelectOption>)}
          </IonSelect></IonItem>
          <IonItem><IonSelect label="Modalidad" labelPlacement="stacked" value={modality} onIonChange={(e) => setModality(e.detail.value === 'virtual' ? 'virtual' : 'presencial')} interface="popover">
            <IonSelectOption value="presencial">Presencial</IonSelectOption>
            <IonSelectOption value="virtual">Virtual</IonSelectOption>
          </IonSelect></IonItem>
          <IonItem><IonInput label={modality === 'virtual' ? 'Enlace o plataforma' : 'Lugar'} labelPlacement="stacked" placeholder={modality === 'virtual' ? 'Ej. Enlace de Teams' : 'Ej. Salón 3223'} maxlength={120} value={place} onIonInput={(e) => setPlace(String(e.detail.value ?? ''))} /></IonItem>
        </div>
        <IonButton className="form-submit" disabled={busy} onClick={() => void createSchedule()}>{busy ? 'Guardando…' : 'Publicar horario'}</IonButton>
      </>}
      {subjectsError && <InlineState danger>{subjectsError}</InlineState>}
    </section>
    {notice && <InlineState>{notice}</InlineState>}
    <h2 className="section-heading">Próximos horarios</h2>
    <FilterTabs options={options} value={filter} onChange={setFilter} />
    {loading && <IonLoading isOpen message="Cargando horarios…" />}{error && <InlineState danger>No se pudieron cargar tus horarios: {error}</InlineState>}
    {!loading && !error && slots.length === 0 && <InlineState>No tienes horarios próximos publicados.</InlineState>}
    {!loading && !error && slots.length > 0 && visibleSlots.length === 0 && <InlineState>No hay horarios en esta categoría.</InlineState>}
    <div className="portal-grid">{visibleSlots.map((slot) => <SlotCard key={slot.id} slot={slot} action={<>
      {slot.reservado ? <IonBadge color="warning">Reservado</IonBadge> : <IonBadge color="success">Disponible</IonBadge>}
      {!slot.reservado && !slot.tieneHistorial && <IonButton fill="outline" color="danger" disabled={busy} onClick={() => void removeSchedule(slot)}>{busy ? 'Eliminando…' : 'Eliminar horario'}</IonButton>}
    </>} />)}</div>
  </PortalLayout>;
}
