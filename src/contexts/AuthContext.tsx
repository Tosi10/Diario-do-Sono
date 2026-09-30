import { demoPersona } from "@/src/content/demoPersona";
import {
  demoCreateProfile,
  demoEnsureProfessional,
  demoGetUser,
  demoLinkByCode,
  demoSeedSessionPatientHistory,
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
  sendEmailVerification,
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
  sendVerificationEmail: () => Promise<void>;
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
    if (role === "professional" || role === "admin") {
      const created = demoCreateProfile({
        uid: demoPersona.professional.uid,
        email: demoPersona.professional.email,
        displayName: demoPersona.professional.displayName,
        role: "professional",
        clinicName: demoPersona.professional.clinicName,
        inviteCode: demoPersona.professional.inviteCode,
      });
      setUser({ uid: created.uid, email: created.email });
      setProfile(created);
      return;
    }

    demoEnsureProfessional();
    const created = demoCreateProfile({
      uid: demoPersona.patient.uid,
      email: demoPersona.patient.email,
      displayName: demoPersona.patient.displayName,
      role: "patient",
    });
    demoLinkByCode({
      patientUid: created.uid,
      patientName: created.displayName,
      patientEmail: created.email,
      inviteCode: demoPersona.professional.inviteCode,
    });
    demoSeedSessionPatientHistory({
      patientUid: created.uid,
      professionalId: demoPersona.professional.uid,
    });
    const linked = demoGetUser(created.uid) ?? created;
    setUser({ uid: linked.uid, email: linked.email });
    setProfile(linked);
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
      await sendEmailVerification(cred.user);
      setProfile(created);
    },
    []
  );

  const sendVerificationEmail = useCallback(async () => {
    if (isDemoMode()) return;
    const current = requireAuth().currentUser;
    if (!current) throw new Error("Entre na conta para confirmar o e-mail.");
    await sendEmailVerification(current);
  }, []);

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
      sendVerificationEmail,
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
      sendVerificationEmail,
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
