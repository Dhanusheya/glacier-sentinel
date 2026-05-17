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
4. Enable **"Email/Password"** provider (required for authority login):
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"
5. Enable **"Anonymous"** provider (required for public user login):
   - Click on "Anonymous"
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
2. Copy the contents of **`firestore.rules`** in this repository (project root) and paste them into the Firebase console editor
3. Click **"Publish"**

> **Important:** If you see **"Missing or insufficient permissions"** when logging in, your published rules likely do not include the `publicUsers` collection or Anonymous auth is disabled.

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

### Error: "Missing or insufficient permissions" on login
- Publish the rules from **`firestore.rules`** in the Firebase Console (Firestore → Rules → Publish)
- Enable **Anonymous** sign-in (Authentication → Sign-in method)
- For authority login, enable **Email/Password** sign-in
- Restart the dev server after changing rules

### Error: "Permission denied" in Firestore
- Check your Firestore security rules match `firestore.rules`
- Public users need Anonymous auth; authorities need Email/Password

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

