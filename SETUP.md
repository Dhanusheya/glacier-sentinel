# Quick Setup Guide

## Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable **Email/Password** provider
4. Create **Firestore Database**:
   - Go to Firestore Database
   - Create database in **Test mode** (for development)
   - Choose a location

5. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Click on the Web icon (</>)
   - Copy the `firebaseConfig` object

6. Update `src/config/firebase.ts` with your config:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

## Firestore Security Rules (Development)

For development, you can use these rules. **DO NOT use in production without proper security**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public users collection
    match /publicUsers/{phoneNumber} {
      allow read, write: if request.auth != null;
    }
    
    // Sensor data - read for all authenticated, write for authorities only
    match /sensorData/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'authority';
    }
    
    // Alerts - read for all authenticated, write for authorities only
    match /alerts/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'authority';
    }
  }
}
```

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open browser to the URL shown (usually `http://localhost:5173`)

## Testing the Application

### Create an Authority Account
1. Navigate to `/signup/authority`
2. Fill in all required fields
3. Submit to create account

### Login as Authority
1. Navigate to `/login/authority`
2. Use the email and password you created

### Login as Public User
1. Navigate to `/login/public`
2. Use any phone number (e.g., `+1234567890`)
3. For first-time login, use OTP mode with code `123456`
4. For subsequent logins, you can use any password (stored in Firestore)

## Mock Data

The application uses mock sensor data for demonstration. The data is automatically generated when:
- No sensor data exists in Firestore
- The application needs to display historical data

To populate Firestore with mock data, you can manually add documents to the `sensorData` collection, or the app will use generated mock data as a fallback.

## Production Considerations

Before deploying to production:

1. **Security Rules**: Implement proper Firestore security rules
2. **Phone Authentication**: Replace mock OTP with Firebase Phone Authentication
3. **Input Validation**: Add server-side validation
4. **Error Handling**: Implement comprehensive error handling
5. **Logging**: Add proper logging and monitoring
6. **Rate Limiting**: Implement rate limiting for API calls
7. **Data Validation**: Validate all user inputs
8. **HTTPS**: Ensure all connections use HTTPS
9. **Environment Variables**: Move Firebase config to environment variables

