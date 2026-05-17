/**
 * Map Firebase / Firestore errors to user-friendly messages.
 */
export function getFirebaseErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
      ? (error as { code: string }).code
      : '';

  const message =
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
      ? (error as { message: string }).message
      : '';

  if (
    code === 'permission-denied' ||
    message.includes('Missing or insufficient permissions')
  ) {
    return (
      'Firestore blocked this request (missing permissions). ' +
      'In Firebase Console → Firestore → Rules, publish the rules from firestore.rules in this project, ' +
      'and enable Anonymous sign-in under Authentication → Sign-in method.'
    );
  }

  if (code === 'auth/operation-not-allowed') {
    return (
      'Email/password sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method.'
    );
  }

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return 'Invalid email or password.';
  }

  if (code === 'auth/user-not-found') {
    return 'No account found with this email. Sign up first.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Wait a few minutes and try again.';
  }

  if (message) {
    return message;
  }

  return 'Something went wrong. Please try again.';
}
