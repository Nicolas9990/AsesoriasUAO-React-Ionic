// Autenticación central: conserva la sesión y comparte sus acciones con toda la app.
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword, onAuthStateChanged, reload,
  sendEmailVerification, signInWithEmailAndPassword, signOut, updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Tipos que describen el rol y perfil que la app guarda para cada persona.
export type UserRole = 'estudiante' | 'profesor';

export interface UserProfile {
  uid: string;
  nombre: string;
  correo: string;
  rol: UserRole;
}

export interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  verificationPending: boolean;
  error: string;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
}

// El contexto es el canal por el que las páginas reciben los datos de sesión.
export const AuthContext = createContext<AuthContextValue | null>(null);

// Mantiene la sesión y el perfil disponibles para toda la aplicación.
export function AuthProvider({ children }: { children: ReactNode }) {
  // Estados compartidos: usuario de Firebase, perfil de Firestore y mensajes de carga/error.
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationPending, setVerificationPending] = useState(false);
  const [error, setError] = useState('');

  // Carga el perfil tras iniciar sesión; si no existe, crea uno nuevo como estudiante.
  const loadProfile = useCallback(async (currentUser: User) => {
    if (!db) return;
    setLoading(true);
    setUser(currentUser);
    setProfile(null);
    setError('');

    // Solo una cuenta con correo confirmado puede entrar al flujo normal.
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

        // Guarda el perfil privado y el nombre público en una sola operación.
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

  // Firebase avisa cuando alguien inicia o cierra sesión; aquí sincronizamos React.
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

  // Acciones que las páginas pueden usar para iniciar sesión, registrarse o salir.
  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    loading,
    verificationPending,
    error,
    clearError: () => setError(''),
    // Comprueba correo y contraseña con Firebase Authentication.
    signIn: async (email, password) => {
      if (!auth) throw new Error('Completa la configuración de Firebase.');
      setError('');
      await signInWithEmailAndPassword(auth, email.trim(), password);
    },
    // Crea la cuenta, guarda el nombre visible y manda la verificación por correo.
    register: async (name, email, password) => {
      if (!auth) throw new Error('Completa la configuración de Firebase.');
      setError('');
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });
      await sendEmailVerification(credential.user);
    },
    // Envía de nuevo el correo de verificación si la persona no lo recibió.
    resendVerification: async () => {
      if (!auth?.currentUser) throw new Error('Inicia sesión para reenviar la confirmación.');
      await sendEmailVerification(auth.currentUser);
    },
    // Actualiza el token y vuelve a leer el perfil después de verificar el correo.
    refreshProfile: async () => {
      const currentUser = auth?.currentUser;
      if (!currentUser) throw new Error('Tu sesión ya no está disponible.');
      await reload(currentUser);
      await currentUser.getIdToken(true);
      await loadProfile(currentUser);
    },
    // Cierra la sesión actual de Firebase.
    signOutUser: async () => {
      if (auth) await signOut(auth);
    },
  }), [user, profile, loading, verificationPending, error, loadProfile]);

  // El proveedor de contexto pone esta información al alcance de toda la app.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


// Atajo para que una página lea la sesión sin conocer cómo se guarda internamente.
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return value;
}
