import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User, PublicUser, AuthorityUser } from '../types';
import { DEMO_MODE } from '../config/demoMode';
import * as demoAuth from './demoAuthService';

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

    return userData;
  } catch (error: any) {
    if (error.code === 'auth/api-key-not-valid') {
      throw new Error('Firebase not configured. Please set up Firebase or enable demo mode.');
    }
    throw error;
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
      throw new Error('User data not found');
    }

    return userData;
  } catch (error: any) {
    if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key') {
      throw new Error('Firebase not configured. Please set up Firebase or enable demo mode.');
    }
    throw error;
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
    // Mock implementation - in production, use Firebase Phone Auth
    // For demo, we'll check Firestore for a user with this phone number
    const usersSnapshot = await getDoc(doc(db, 'publicUsers', phoneNumber));
    
    if (!usersSnapshot.exists()) {
      throw new Error('User not found');
    }

    const userData = usersSnapshot.data();
    if (userData.password !== password) {
      throw new Error('Invalid password');
    }

    return {
      uid: userData.uid,
      phoneNumber,
      role: 'public',
    };
  } catch (error: any) {
    if (error.code === 'auth/api-key-not-valid' || error.code?.includes('api-key')) {
      throw new Error('Firebase not configured. Please set up Firebase or enable demo mode.');
    }
    throw error;
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

    return newUser;
  } catch (error: any) {
    if (error.code === 'auth/api-key-not-valid' || error.code?.includes('api-key')) {
      throw new Error('Firebase not configured. Please set up Firebase or enable demo mode.');
    }
    throw error;
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
    // Mock OTP verification - in production, use Firebase Phone Auth
    if (otp !== '123456') {
      throw new Error('Invalid OTP. Demo OTP is: 123456');
    }

    // Check if user exists, if not create one
    const userDoc = await getDoc(doc(db, 'publicUsers', phoneNumber));
    
    if (!userDoc.exists()) {
      // Create new public user
      const newUser: PublicUser = {
        uid: `public_${Date.now()}`,
        phoneNumber,
        role: 'public',
      };
      await setDoc(doc(db, 'publicUsers', phoneNumber), {
        ...newUser,
        password: '', // No password for OTP users
      });
      return newUser;
    }

    return userDoc.data() as PublicUser;
  } catch (error: any) {
    if (error.code === 'auth/api-key-not-valid' || error.code?.includes('api-key')) {
      throw new Error('Firebase not configured. Please set up Firebase or enable demo mode.');
    }
    throw error;
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

  try {
    await signOut(auth);
  } catch (error: any) {
    if (error.code === 'auth/api-key-not-valid' || error.code?.includes('api-key')) {
      // If Firebase fails, try demo signout
      return demoAuth.demoSignOut();
    }
    throw error;
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

