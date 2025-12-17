import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { DEMO_MODE } from './demoMode';

// ============================================
// FIREBASE CONFIGURATION
// ============================================
// IMPORTANT: Replace these with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps > Web app
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyDecJUlbiudHIz9Seu07ff6t0aBej9giYc",
  authDomain: "glacier-sentinel-web.firebaseapp.com",
  projectId: "glacier-sentinel-web",
  storageBucket: "glacier-sentinel-web.firebasestorage.app",
  messagingSenderId: "463258396662",
  appId: "1:463258396662:web:53609306142e262e9f09d7",
  measurementId: "G-CDS0YBWCM3"
};

// ============================================
// Initialize Firebase
// ============================================
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (!DEMO_MODE) {
  try {
    // Check if Firebase config still has placeholder values
    if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE" || 
        firebaseConfig.projectId === "YOUR_PROJECT_ID" ||
        firebaseConfig.apiKey.includes("YOUR_") ||
        firebaseConfig.projectId.includes("YOUR_")) {
      // Don't throw - let the app initialize and show error component
      console.error(
        'Firebase not configured! Please update src/config/firebase.ts with your Firebase credentials.\n' +
        'See FIREBASE_SETUP.md for detailed instructions.'
      );
      // Set to null so components can detect and show error
      app = null;
      auth = null;
      db = null;
    } else {
      // Only initialize if not already initialized
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
      } else {
        app = getApps()[0];
        auth = getAuth(app);
        db = getFirestore(app);
      }
    }
    } catch (error: any) {
      console.error('Firebase initialization error:', error.message);
      // Set to null so components can detect and show error
      app = null;
      auth = null;
      db = null;
    }
}

// Export Firebase services
export { auth, db };
export default app;

