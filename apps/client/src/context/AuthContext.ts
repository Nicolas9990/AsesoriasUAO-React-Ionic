import { createContext } from 'react';
import type { User } from 'firebase/auth';

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

export const AuthContext = createContext<AuthContextValue | null>(null);
