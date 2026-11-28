import { useEffect, useState } from 'react';
import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../helpers/errors';
import { useCamera } from './useCamera';

const MAX_PHOTO_LENGTH = 200000;

export function useProfilePhoto() {
  const { user } = useAuth();
  const { takePhoto } = useCamera();
  const [photo, setPhoto] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!db || !user) return;
    return onSnapshot(doc(db, 'fotosPerfil', user.uid), (snapshot) => {
      setPhoto(snapshot.exists() ? String(snapshot.get('foto') ?? '') : '');
    }, (cause) => setError(errorMessage(cause)));
  }, [user?.uid]);

  async function changePhoto() {
    if (!db || !user) return;
    const dataUrl = await takePhoto({ maxSize: 300 });
    if (!dataUrl) return;
    if (dataUrl.length > MAX_PHOTO_LENGTH) { setError('La foto es muy pesada, intenta con otra.'); return; }
    setSaving(true); setError('');
    try {
      await setDoc(doc(db, 'fotosPerfil', user.uid), { foto: dataUrl, actualizadaEn: serverTimestamp() });
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setSaving(false); }
  }

  async function removePhoto() {
    if (!db || !user) return;
    setSaving(true); setError('');
    try {
      await deleteDoc(doc(db, 'fotosPerfil', user.uid));
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setSaving(false); }
  }

  return { photo, saving, error, changePhoto, removePhoto };
}
