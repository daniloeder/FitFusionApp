import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { FIREBASE_CONFIG_API_KEY, FIREBASE_CONFIG_AUTH_DOMAIN, FIREBASE_CONFIG_PROJECT_ID, FIREBASE_CONFIG_STORAGE_BUCKET, FIREBASE_CONFIG_MESSAGING_SENDER_ID, FIREBASE_CONFIG_APP_ID } from '@env';

const firebaseConfig = {
  apiKey: FIREBASE_CONFIG_API_KEY,
  authDomain: FIREBASE_CONFIG_AUTH_DOMAIN,
  projectId: FIREBASE_CONFIG_PROJECT_ID,
  storageBucket: FIREBASE_CONFIG_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_CONFIG_MESSAGING_SENDER_ID,
  appId: FIREBASE_CONFIG_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);