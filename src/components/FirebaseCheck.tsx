import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { DEMO_MODE } from '../config/demoMode';
import { FirebaseConfigError } from './FirebaseConfigError';

export function FirebaseCheck({ children }: { children: React.ReactNode }) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!DEMO_MODE) {
      // Check if Firebase is properly configured
      if (!auth || !db) {
        setShowError(true);
      } else {
        // Test Firebase connection
        try {
          // Just check if auth is available
          if (auth && db) {
            setShowError(false);
          }
        } catch (error) {
          setShowError(true);
        }
      }
    }
  }, []);

  if (!DEMO_MODE && showError) {
    return <FirebaseConfigError />;
  }

  return <>{children}</>;
}

