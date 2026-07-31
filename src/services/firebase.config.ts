/**
 * Firebase — só inicializa se houver .env.
 * Sem credenciais: modo demo (sem banco).
 */
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId &&
      !firebaseConfig.apiKey.includes("your-") &&
      firebaseConfig.projectId !== "your-project-id"
  );
}

/** Sem Firebase = demo local. */
export function isDemoMode(): boolean {
  return !isFirebaseConfigured();
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured()) {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0]!;
  }

  try {
    const getReactNativePersistence = (
      FirebaseAuth as unknown as {
        getReactNativePersistence?: (storage: unknown) => unknown;
      }
    ).getReactNativePersistence;
    if (typeof getReactNativePersistence === "function") {
      auth = FirebaseAuth.initializeAuth(app, {
        persistence: getReactNativePersistence(
          ReactNativeAsyncStorage
        ) as never,
      });
    } else {
      auth = FirebaseAuth.getAuth(app);
    }
  } catch {
    auth = FirebaseAuth.getAuth(app);
  }

  db = getFirestore(app);
  storage = getStorage(app);
}

export { auth, db, storage };
export default app;

export function requireAuth(): Auth {
  if (!auth) throw new Error("Firebase Auth não configurado (modo demo).");
  return auth;
}

export function requireDb(): Firestore {
  if (!db) throw new Error("Firestore não configurado (modo demo).");
  return db;
}
