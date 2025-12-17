export function FirebaseConfigError() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '600px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      }}>
        <h2 style={{ color: '#dc2626', marginBottom: '20px' }}>
          ⚠️ Firebase Not Configured
        </h2>
        <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
          To use Firebase authentication and database, you need to configure your Firebase project credentials.
        </p>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '10px' }}>Quick Setup:</h3>
          <ol style={{ paddingLeft: '20px', lineHeight: '2' }}>
            <li>Create a Firebase project at <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
            <li>Enable Authentication (Email/Password)</li>
            <li>Create a Firestore database</li>
            <li>Copy your Firebase config</li>
            <li>Update <code>src/config/firebase.ts</code> with your credentials</li>
          </ol>
        </div>
        <div style={{ 
          backgroundColor: '#f3f4f6', 
          padding: '15px', 
          borderRadius: '6px',
          marginBottom: '20px',
        }}>
          <strong>📖 Detailed Instructions:</strong> See <code>FIREBASE_SETUP.md</code> file in the project root.
        </div>
        <div style={{ 
          backgroundColor: '#fef3c7', 
          padding: '15px', 
          borderRadius: '6px',
          marginBottom: '20px',
        }}>
          <strong>💡 Alternative:</strong> Set <code>DEMO_MODE = true</code> in <code>src/config/demoMode.ts</code> to use localStorage instead (for testing only).
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Reload After Configuration
        </button>
      </div>
    </div>
  );
}

