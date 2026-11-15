import { useState, type FormEvent } from 'react';
import {
  IonButton, IonContent, IonInput, IonItem, IonLoading, IonPage, IonText,
} from '@ionic/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function AuthPage({ register = false }: { register?: boolean }) {
  const { signIn, register: createAccount, error: authError, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    clearError();
    const normalizedEmail = email.trim().toLowerCase();
    if (register && name.trim().length < 3) {
      setError('Escribe tu nombre completo (al menos 3 caracteres).');
      return;
    }
    if (register && !/^[^@\s]+@uao\.edu\.co$/.test(normalizedEmail)) {
      setError('Regístrate con tu correo institucional @uao.edu.co.');
      return;
    }
    setBusy(true);
    try {
      if (register) {
        await createAccount(name, normalizedEmail, password);
        setMessage('Te enviamos un enlace para confirmar tu correo institucional.');
      }
      else await signIn(normalizedEmail, password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo completar la solicitud.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen className="auth-content">
        <main className="auth-layout">
          <section className="auth-brand">
            <div className="brand-mark">UAO</div>
            <p className="eyebrow">Universidad Autónoma de Occidente</p>
            <h1>Asesorías entre estudiantes y profesores.</h1>
            <p className="brand-copy">Encuentra acompañamiento académico y organiza tus espacios de asesoría desde cualquier dispositivo.</p>
          </section>
          <section className="auth-card">
            <div className="auth-card-heading">
              <p className="eyebrow">PLATAFORMA ACADÉMICA</p>
              <h2>{register ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h2>
              <p>{register ? 'Regístrate como estudiante para comenzar.' : 'Ingresa para gestionar tus asesorías.'}</p>
            </div>
            <form onSubmit={submit}>
              {register && <IonItem className="form-item"><IonInput label="Nombre completo" labelPlacement="stacked" autocomplete="name" value={name} onIonInput={(e) => setName(e.detail.value ?? '')} required minlength={3} maxlength={100} /></IonItem>}
              <IonItem className="form-item"><IonInput label="Correo institucional" labelPlacement="stacked" type="email" autocomplete="email" value={email} onIonInput={(e) => setEmail(e.detail.value ?? '')} required /></IonItem>
              <IonItem className="form-item"><IonInput label="Contraseña" labelPlacement="stacked" type="password" autocomplete={register ? 'new-password' : 'current-password'} value={password} onIonInput={(e) => setPassword(e.detail.value ?? '')} required minlength={8} /></IonItem>
              {(error || authError) && <IonText color="danger"><p className="form-error">{error || authError}</p></IonText>}
              {message && <IonText color="success"><p className="form-error">{message}</p></IonText>}
              <IonButton expand="block" type="submit" disabled={busy} className="primary-action">{register ? 'Crear cuenta' : 'Iniciar sesión'}</IonButton>
            </form>
            <p className="auth-switch">{register ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'} <Link to={register ? '/login' : '/registro'}>{register ? 'Inicia sesión' : 'Regístrate'}</Link></p>
          </section>
        </main>
      </IonContent>
      <IonLoading isOpen={busy} message="Un momento…" />
    </IonPage>
  );
}
