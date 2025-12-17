# Firebase Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Enter a project name (e.g., "Glacier Sentinel")
4. Follow the setup wizard (Google Analytics is optional)

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Enable **"Email/Password"** provider:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 3: Create Firestore Database

1. Go to **Firestore Database** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
   - ⚠️ **Important**: For production, you'll need to set up proper security rules
4. Select a location (choose the closest to your users)
5. Click **"Enable"**

## Step 4: Get Your Firebase Configuration

1. Go to **Project Settings** (gear icon next to "Project Overview")
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (`</>`)
4. Register your app:
   - App nickname: "Glacier Sentinel Web"
   - Firebase Hosting: Not needed (optional)
   - Click **"Register app"**
5. Copy the `firebaseConfig` object that appears

## Step 5: Update Your Application

1. Open `src/config/firebase.ts` in your project
2. Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSy...",  // Your actual API key
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 6: Set Up Firestore Security Rules

1. Go to **Firestore Database** > **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    /* =========================
       USERS (PROFILE DATA)
       ========================= */
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;

      // Allow update ONLY for non-role fields
      allow update: if request.auth != null
        && request.auth.uid == userId
        && !( "role" in request.resource.data );

      allow create: if request.auth != null && request.auth.uid == userId;
    }

    /* =========================
       SENSOR DATA (STRICT)
       ========================= */
    match /sensorData/{docId} {
      // ONLY authorities can read sensor data
      allow read, write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.role == "authority";
    }

    /* =========================
       RISK STATUS (PUBLIC SAFE DATA)
       ========================= */
    match /riskStatus/{dayId} {
      // Public users can read ONLY risk level
      allow read: if request.auth != null;

      // Only authorities can write/update risk status
      allow write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.role == "authority";
    }

    /* =========================
       ALERTS / NOTIFICATIONS
       ========================= */
    match /alerts/{alertId} {
      allow read: if request.auth != null;

      allow write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.role == "authority";
    }
  }
}


3. Click **"Publish"**

## Step 7: Verify Setup

1. Make sure `DEMO_MODE = false` in `src/config/demoMode.ts`
2. Restart your dev server: `npm run dev`
3. Try creating an authority account at `/signup/authority`
4. Check Firebase Console to see if the user was created in Authentication

## Troubleshooting

### Error: "Firebase not configured"
- Make sure you've updated `src/config/firebase.ts` with your actual credentials
- Verify all fields are filled in (no "YOUR_..." placeholders)

### Error: "auth/api-key-not-valid"
- Double-check your API key in `firebaseConfig`
- Make sure you copied the entire key without any extra spaces

### Error: "Permission denied" in Firestore
- Check your Firestore security rules
- Make sure you're authenticated before trying to read/write data

### Users not appearing in Firestore
- Check the browser console for errors
- Verify Firestore is enabled and rules are published
- Make sure you're looking at the correct database (not a different project)

## Production Considerations

Before deploying to production:

1. **Update Security Rules**: The test mode rules are too permissive for production
2. **Enable App Check**: Add App Check to prevent abuse
3. **Set up proper indexes**: For any complex queries
4. **Enable Firebase Hosting**: For better performance
5. **Set up monitoring**: Enable Firebase Performance Monitoring

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)

