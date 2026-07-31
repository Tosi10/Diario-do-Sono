import {
  demoCreateProfile,
  demoGetUser,
} from "@/src/services/demoStore";
import {
  isDemoMode,
  isFirebaseConfigured,
  requireAuth,
} from "@/src/services/firebase.config";
import { createSonoUser, fetchSonoUser } from "@/src/services/users";
import type { SonoRole, SonoUserProfile } from "@/src/types";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type DemoUser = { uid: string; email: string };

type AuthContextValue = {
  ready: boolean;
  configured: boolean;
  demoMode: boolean;
  user: User | DemoUser | null;
  profile: SonoUserProfile | null;
  role: SonoRole | null;
  refreshProfile: () => Promise<void>;
  /** Entra direto nas telas sem Firebase */
  enterDemo: (role: SonoRole) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (params: {
    email: string;
    password: string;
    displayName: string;
    role: SonoRole;
    clinicName?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isFirebaseConfigured();
  const demoMode = isDemoMode();
  const [ready, setReady] = useState(true);
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [profile, setProfile] = useState<SonoUserProfile | null>(null);

  const loadProfile = useCallback(async (uid: string) => {
    if (isDemoMode()) {
      setProfile(demoGetUser(uid));
      return;
    }
    const doc = await fetchSonoUser(uid);
    setProfile(doc);
  }, []);

  useEffect(() => {
    if (demoMode) {
      setReady(true);
      return;
    }

    let cancelled = false;
    const safety = setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 4000);

    const auth = requireAuth();
    const unsub = onAuthStateChanged(auth, async (next) => {
      setUser(next);
      if (!next) {
        setProfile(null);
        setReady(true);
        return;
      }
      try {
        await loadProfile(next.uid);
      } catch (err) {
        console.warn("[Sono] fetch profile failed:", err);
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(safety);
      unsub();
    };
  }, [demoMode, loadProfile]);

  const enterDemo = useCallback((role: SonoRole) => {
    const uid =
      role === "patient" ? "demo-session-patient" : "demo-session-pro";
    const created = demoCreateProfile({
      uid,
      email: role === "patient" ? "paciente@demo.local" : "pro@demo.local",
      displayName: role === "patient" ? "Paciente Demo" : "Dra. Demo",
      role,
      clinicName: "Clínica Demo",
    });
    setUser({ uid, email: created.email });
    setProfile(created);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (isDemoMode()) {
      throw new Error("Modo demo: use os botões Entrar como…");
    }
    await signInWithEmailAndPassword(requireAuth(), email.trim(), password);
  }, []);

  const signUp = useCallback(
    async (params: {
      email: string;
      password: string;
      displayName: string;
      role: SonoRole;
      clinicName?: string;
    }) => {
      if (isDemoMode()) {
        const uid = `demo-${params.role}-${Date.now()}`;
        const created = demoCreateProfile({
          uid,
          email: params.email.trim(),
          displayName: params.displayName.trim() || "Usuário",
          role: params.role,
          clinicName: params.clinicName,
        });
        setUser({ uid, email: created.email });
        setProfile(created);
        return;
      }
      const auth = requireAuth();
      const cred = await createUserWithEmailAndPassword(
        auth,
        params.email.trim(),
        params.password
      );
      const name = params.displayName.trim() || "Usuário";
      await updateProfile(cred.user, { displayName: name });
      const created = await createSonoUser({
        uid: cred.user.uid,
        email: params.email.trim(),
        displayName: name,
        role: params.role,
        clinicName: params.clinicName,
      });
      setProfile(created);
    },
    []
  );

  const signOut = useCallback(async () => {
    setProfile(null);
    setUser(null);
    if (!isDemoMode()) {
      await firebaseSignOut(requireAuth());
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await loadProfile(user.uid);
  }, [loadProfile, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      configured,
      demoMode,
      user,
      profile,
      role: profile?.role ?? null,
      refreshProfile,
      enterDemo,
      signIn,
      signUp,
      signOut,
    }),
    [
      ready,
      configured,
      demoMode,
      user,
      profile,
      refreshProfile,
      enterDemo,
      signIn,
      signUp,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
