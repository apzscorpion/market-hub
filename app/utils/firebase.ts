import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

function getFirebaseConfig() {
  const config = useRuntimeConfig()
  return {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
  }
}

export function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(getFirebaseConfig())
}

export const auth = () => getAuth(getFirebaseApp())
export const db = () => getFirestore(getFirebaseApp())
export const storage = () => getStorage(getFirebaseApp())
