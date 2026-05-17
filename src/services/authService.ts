import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User, PublicUser, AuthorityUser } from '../types';
import { DEMO_MODE } from '../config/demoMode';
import * as demoAuth from './demoAuthService';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';

export const PUBLIC_SESSION_KEY = 'glacier_sentinel_public_session';

function savePublicSession(user: PublicUser): void {
  localStorage.setItem(PUBLIC_SESSION_KEY, JSON.stringify(user));
}

export function clearPublicSession(): void {
  localStorage.removeItem(PUBLIC_SESSION_KEY);
}

export function loadPublicSession(): PublicUser | null {
  try {
    const stored = localStorage.getItem(PUBLIC_SESSION_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as PublicUser;
  } catch {
    return null;
  }
}

/** Sign in anonymously so Firestore rules allow authenticated reads/writes. */
async function ensurePublicFirestoreAuth(): Promise<string> {
  if (!auth) {
    throw new Error('Firebase not configured. Please set up Firebase or enable demo mode.');
  }
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
  if (!auth.currentUser) {
    throw new Error('Could not start a public session. Enable Anonymous sign-in in Firebase Console.');
  }
  return auth.currentUser.uid;
}

async function syncPublicUserProfile(user: PublicUser): Promise<void> {
  if (!db || !auth?.currentUser) return;
  await setDoc(
    doc(db, 'users', auth.currentUser.uid),
    {
      uid: user.uid,
      phoneNumber: user.phoneNumber,
      role: 'public',
    },
    { merge: true }
  );
}

function wrapFirebaseError(error: unknown): Error {
  return new Error(getFirebaseErrorMessage(error));
}

/**
 * Store user data in Firestore
 */
async function storeUserData(uid: string, userData: Partial<User>) {
  if (!db) throw new Error('Firebase not initialized');
  await setDoc(doc(db, 'users', uid), {
    ...userData,
    createdAt: Date.now(),
  });
}

/**
 * Get user data from Firestore
 */
export async function getUserData(uid: string): Promise<User | null> {
  if (DEMO_MODE) {
    return demoAuth.demoGetCurrentUser();
  }

  if (!db) {
    return demoAuth.demoGetCurrentUser();
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error: any) {
    if (error.code === 'auth/api-key-not-valid' || error.code?.includes('api-key')) {
      return demoAuth.demoGetCurrentUser();
    }
    throw error;
  }
}

/**
 * Sign up authority user
 */
export async function signUpAuthority(
  email: string,
  password: string,
  name: string,
  phoneNumber: string,
  designation: string
): Promise<AuthorityUser> {
  if (DEMO_MODE) {
    return demoAuth.demoSignUpAuthority(email, password, name, phoneNumber, designation);
  }

  if (!auth || !db) {
    throw new Error('Firebase not configured. Please set up Firebase or enable demo mode.');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, { displayName: name });

    const userData: AuthorityUser = {
      uid: firebaseUser.uid,
      email,
      name,
      phoneNumber,
      designation,
      role: 'authority',
    };

    await storeUserData(firebaseUser.uid, userData);
    clearPublicSession();

    return userData;
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'auth/api-key-not-valid'
    ) {
      throw new Error('Firebase not configured. Please set up Firebase or enable demo mode.');
    }
    throw wrapFirebaseError(error);
  }
}

/**
 * Sign in with email and password (for authorities)
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  if (DEMO_MODE) {
    return demoAuth.demoSignInWithEmail(email, password);
  }

  if (!auth || !db) {
    throw new Error('Firebase not configured. Please set up Firebase or enable demo mode.');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userData = await getUserData(userCredential.user.uid);
    
    if (!userData) {
      throw new Error(
        'Account signed in but profile is missing. Sign up again or check Firestore rules for the users collection.'
      );
    }

    clearPublicSession();
    return userData;
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      ['auth/api-key-not-valid', 'auth/invalid-api-key'].includes((error as { code: string }).code)
    ) {
      throw new Error('Firebase not configured. Please set up Firebase or enable demo mode.');
    }
    throw wrapFirebaseError(error);
  }
}

/**
 * Sign in public user with phone number and password
 * Note: In production, this would use Firebase Phone Auth
 * For demo purposes, we'll use a mock implementation
 */
export async function signInPublicUser(
  phoneNumber: string,
  password: string
): Promise<PublicUser> {
  if (DEMO_MODE) {
    return demoAuth.demoSignInPublicUser(phoneNumber, password);
  }

  if (!db) {
    throw new Error('Firebase not configured. Please set up Firebase or enable demo mode.');
  }

  try {
    const usersSnapshot = await getDoc(doc(db, 'publicUsers', phoneNumber));

    if (!usersSnapshot.exists()) {
      throw new Error('User not found. Create an account or use OTP login.');
    }

    const userData = usersSnapshot.data();
    if (userData.password !== password) {
      throw new Error('Invalid password');
    }

    await ensurePublicFirestoreAuth();

    const publicUser: PublicUser = {
      uid: userData.uid,
      phoneNumber,
      role: 'public',
    };

    await syncPublicUserProfile(publicUser);
    savePublicSession(publicUser);
    return publicUser;
  } catch (error: unknown) {
    if (error instanceof Error && !('code' in error)) {
      throw error;
    }
    throw wrapFirebaseError(error);
  }
}

/**
 * Sign up public user with phone number and password
 * Demo: uses localStorage. Firebase: stores in `publicUsers` collection.
 */
export async function signUpPublic(
  phoneNumber: string,
  password: string
): Promise<PublicUser> {
  if (DEMO_MODE) {
    return demoAuth.demoSignUpPublic(phoneNumber, password);
  }

  if (!db) {
    throw new Error('Firebase not configured. Please set up Firebase or enable demo mode.');
  }

  try {
    const userRef = doc(db, 'publicUsers', phoneNumber);
    const existing = await getDoc(userRef);

    if (existing.exists()) {
      throw new Error('Mobile number already registered');
    }

    await ensurePublicFirestoreAuth();

    const newUser: PublicUser = {
      uid: `public_${Date.now()}`,
      phoneNumber,
      role: 'public',
    };

    await setDoc(userRef, {
      ...newUser,
      password,
      createdAt: Date.now(),
    });

    await syncPublicUserProfile(newUser);
    savePublicSession(newUser);
    return newUser;
  } catch (error: unknown) {
    if (error instanceof Error && !('code' in error)) {
      throw error;
    }
    throw wrapFirebaseError(error);
  }
}

/**
 * OTP-based login for public users (mock implementation)
 */
export async function signInWithOTP(phoneNumber: string, otp: string): Promise<PublicUser> {
  if (DEMO_MODE) {
    return demoAuth.demoSignInWithOTP(phoneNumber, otp);
  }

  if (!db) {
    throw new Error('Firebase not configured. Please set up Firebase or enable demo mode.');
  }

  try {
    if (otp !== '123456') {
      throw new Error('Invalid OTP. Demo OTP is: 123456');
    }

    await ensurePublicFirestoreAuth();

    const userDoc = await getDoc(doc(db, 'publicUsers', phoneNumber));
    let publicUser: PublicUser;

    if (!userDoc.exists()) {
      publicUser = {
        uid: `public_${Date.now()}`,
        phoneNumber,
        role: 'public',
      };
      await setDoc(doc(db, 'publicUsers', phoneNumber), {
        ...publicUser,
        password: '',
        createdAt: Date.now(),
      });
    } else {
      const data = userDoc.data();
      publicUser = {
        uid: data.uid,
        phoneNumber,
        role: 'public',
      };
    }

    await syncPublicUserProfile(publicUser);
    savePublicSession(publicUser);
    return publicUser;
  } catch (error: unknown) {
    if (error instanceof Error && !('code' in error)) {
      throw error;
    }
    throw wrapFirebaseError(error);
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  if (DEMO_MODE) {
    return demoAuth.demoSignOut();
  }

  if (!auth) {
    return demoAuth.demoSignOut();
  }

  clearPublicSession();

  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      String((error as { code: string }).code).includes('api-key')
    ) {
      return demoAuth.demoSignOut();
    }
    throw wrapFirebaseError(error);
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<User>
): Promise<void> {
  if (DEMO_MODE) {
    return demoAuth.demoUpdateUserProfile(uid, updates);
  }

  if (!db) {
    throw new Error('Firebase not configured. Please set up Firebase or enable demo mode.');
  }

  try {
    await updateDoc(doc(db, 'users', uid), updates);
    
    // Also update public users collection if it's a public user
    if (updates.phoneNumber) {
      await updateDoc(doc(db, 'publicUsers', updates.phoneNumber), updates);
    }
  } catch (error: any) {
    if (error.code === 'auth/api-key-not-valid' || error.code?.includes('api-key')) {
      throw new Error('Firebase not configured. Please set up Firebase or enable demo mode.');
    }
    throw error;
  }
}

