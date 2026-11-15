import {
  useCallback, useEffect, useMemo, useState, type PropsWithChildren,
} from 'react';
import {
  createUserWithEmailAndPassword, onAuthStateChanged, reload,
  sendEmailVerification, signInWithEmailAndPassword, signOut, updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AuthContext, type AuthContextValue, type UserProfile } from './AuthContext';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationPending, setVerificationPending] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async (currentUser: User) => {
    if (!db) return;
    setLoading(true);
    setUser(currentUser);
    setProfile(null);
    setError('');

    if (!currentUser.emailVerified) {
      setVerificationPending(true);
      setError('Confirma tu correo institucional para habilitar tu cuenta.');
      setLoading(false);
      return;
    }

    setVerificationPending(false);
    try {
      const profileRef = doc(db, 'perfiles', currentUser.uid);
      const publicProfileRef = doc(db, 'perfilesPublicos', currentUser.uid);
      const snapshot = await getDoc(profileRef);

      if (!snapshot.exists()) {
        const nombre = currentUser.displayName?.trim() ?? '';
        if (nombre.length < 3 || !currentUser.email) {
          setError('No fue posible crear un perfil válido para esta cuenta.');
          return;
        }

        const batch = writeBatch(db);
        batch.set(profileRef, {
          uid: currentUser.uid,
          nombre,
          correo: currentUser.email,
          rol: 'estudiante',
          creadoEn: serverTimestamp(),
        });
        batch.set(publicProfileRef, {
          uid: currentUser.uid,
          nombre,
          creadoEn: serverTimestamp(),
        });
        await batch.commit();

        setProfile({
          uid: currentUser.uid,
          nombre,
          correo: currentUser.email,
          rol: 'estudiante',
        });
        return;
      }

      const data = snapshot.data();
      if (data.rol !== 'estudiante' && data.rol !== 'profesor') {
        setError('El perfil no tiene un rol válido. Contacta al equipo administrador.');
        return;
      }

      setProfile({
        uid: currentUser.uid,
        nombre: String(data.nombre ?? currentUser.displayName ?? ''),
        correo: currentUser.email ?? '',
        rol: data.rol,
      });
    } catch {
      setError('No se pudo cargar tu perfil. Revisa la conexión y las reglas de Firestore.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setUser(null);
        setProfile(null);
        setVerificationPending(false);
        setError('');
        setLoading(false);
        return;
      }
      await loadProfile(nextUser);
    });
  }, [loadProfile]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    loading,
    verificationPending,
    error,
    clearError: () => setError(''),
    signIn: async (email, password) => {
      if (!auth) throw new Error('Completa la configuración de Firebase.');
      setError('');
      await signInWithEmailAndPassword(auth, email.trim(), password);
    },
    register: async (name, email, password) => {
      if (!auth) throw new Error('Completa la configuración de Firebase.');
      setError('');
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });
      await sendEmailVerification(credential.user);
    },
    resendVerification: async () => {
      if (!auth?.currentUser) throw new Error('Inicia sesión para reenviar la confirmación.');
      await sendEmailVerification(auth.currentUser);
    },
    refreshProfile: async () => {
      const currentUser = auth?.currentUser;
      if (!currentUser) throw new Error('Tu sesión ya no está disponible.');
      await reload(currentUser);
      await currentUser.getIdToken(true);
      await loadProfile(currentUser);
    },
    signOutUser: async () => {
      if (auth) await signOut(auth);
    },
  }), [user, profile, loading, verificationPending, error, loadProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
