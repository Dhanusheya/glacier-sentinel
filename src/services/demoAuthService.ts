/**
 * Demo Authentication Service
 * Uses localStorage for authentication when Firebase is not configured
 */
import type { User, PublicUser, AuthorityUser } from '../types';

const DEMO_STORAGE_KEY = 'glacier_sentinel_demo_users';
const DEMO_CURRENT_USER_KEY = 'glacier_sentinel_current_user';

interface DemoUser {
  uid: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  name?: string;
  designation?: string;
  role: 'public' | 'authority';
}

function getDemoUsers(): DemoUser[] {
  const stored = localStorage.getItem(DEMO_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveDemoUsers(users: DemoUser[]) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(users));
}

function getCurrentDemoUser(): User | null {
  const stored = localStorage.getItem(DEMO_CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

function setCurrentDemoUser(user: User | null) {
  if (user) {
    localStorage.setItem(DEMO_CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(DEMO_CURRENT_USER_KEY);
  }
}

export async function demoSignUpAuthority(
  email: string,
  password: string,
  name: string,
  phoneNumber: string,
  designation: string
): Promise<AuthorityUser> {
  const users = getDemoUsers();
  
  // Check if email already exists
  if (users.some(u => u.email === email)) {
    throw new Error('Email already registered');
  }

  const newUser: DemoUser = {
    uid: `authority_${Date.now()}`,
    email,
    password,
    name,
    phoneNumber,
    designation,
    role: 'authority',
  };

  users.push(newUser);
  saveDemoUsers(users);

  const userData: AuthorityUser = {
    uid: newUser.uid,
    email,
    name,
    phoneNumber,
    designation,
    role: 'authority',
  };

  setCurrentDemoUser(userData);
  return userData;
}

export async function demoSignInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const users = getDemoUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const userData: User = {
    uid: user.uid,
    email: user.email,
    phoneNumber: user.phoneNumber,
    name: user.name,
    designation: user.designation,
    role: user.role,
  };

  setCurrentDemoUser(userData);
  return userData;
}

export async function demoSignInPublicUser(
  phoneNumber: string,
  password: string
): Promise<PublicUser> {
  const users = getDemoUsers();
  const user = users.find(
    u => u.phoneNumber === phoneNumber && u.password === password
  );

  if (!user) {
    throw new Error('Invalid phone number or password');
  }

  const userData: PublicUser = {
    uid: user.uid,
    phoneNumber,
    role: 'public',
  };

  setCurrentDemoUser(userData);
  return userData;
}

export async function demoSignInWithOTP(
  phoneNumber: string,
  otp: string
): Promise<PublicUser> {
  if (otp !== '123456') {
    throw new Error('Invalid OTP. Demo OTP is: 123456');
  }

  const users = getDemoUsers();
  let user = users.find(u => u.phoneNumber === phoneNumber);

  if (!user) {
    // Create new public user
    const newUser: DemoUser = {
      uid: `public_${Date.now()}`,
      phoneNumber,
      role: 'public',
    };
    users.push(newUser);
    saveDemoUsers(users);
    user = newUser;
  }

  const userData: PublicUser = {
    uid: user.uid,
    phoneNumber,
    role: 'public',
  };

  setCurrentDemoUser(userData);
  return userData;
}

/**
 * Demo signup for public users (mobile number + password)
 * Stores credentials in localStorage and logs the user in.
 */
export async function demoSignUpPublic(
  phoneNumber: string,
  password: string
): Promise<PublicUser> {
  const users = getDemoUsers();

  // Check if phone already exists
  if (users.some(u => u.phoneNumber === phoneNumber)) {
    throw new Error('Mobile number already registered');
  }

  const newUser: DemoUser = {
    uid: `public_${Date.now()}`,
    phoneNumber,
    password,
    role: 'public',
  };

  users.push(newUser);
  saveDemoUsers(users);

  const userData: PublicUser = {
    uid: newUser.uid,
    phoneNumber,
    role: 'public',
  };

  setCurrentDemoUser(userData);
  return userData;
}

export async function demoSignOut(): Promise<void> {
  setCurrentDemoUser(null);
}

export async function demoGetCurrentUser(): Promise<User | null> {
  return getCurrentDemoUser();
}

export async function demoUpdateUserProfile(
  uid: string,
  updates: Partial<User>
): Promise<void> {
  const users = getDemoUsers();
  const userIndex = users.findIndex(u => u.uid === uid);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
  };

  saveDemoUsers(users);

  // Update current user if it's the same user
  const currentUser = getCurrentDemoUser();
  if (currentUser && currentUser.uid === uid) {
    setCurrentDemoUser({ ...currentUser, ...updates } as User);
  }
}

