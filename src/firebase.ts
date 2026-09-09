import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

// User provided Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBNMujKZ1q2H9FomC3WwpdNTxSCZRuqy3Q",
  authDomain: "call-center-86520.firebaseapp.com",
  projectId: "call-center-86520",
  storageBucket: "call-center-86520.firebasestorage.app",
  messagingSenderId: "572916128519",
  appId: "1:572916128519:web:2d9a6f1d5fcea7ba0483a2",
  measurementId: "G-M4FPMQMFSP",
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Analytics safely (guards against non-browser environments or blocked trackers)
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('[Firebase] Initialized analytics with measurement ID:', firebaseConfig.measurementId);
      }
    })
    .catch((err) => {
      console.warn('[Firebase] Analytics not supported in this environment:', err);
    });
}
