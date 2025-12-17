# Glacier Sentinel

A clean, minimal React (Vite) application for disaster management and early warning systems, specifically designed for monitoring glacier lake outburst flood (GLOF) risks.

## Features

### Authentication
- **Public Users**: Login with mobile number and password, or OTP-based recovery
- **Authorities**: Signup and login with email/password, full profile management
- Role-based access control with strict separation

### Public Dashboard (Read-Only)
- Display risk levels only (no raw sensor data)
- Risk status for Today, Yesterday, and Day Before Yesterday
- Color-coded risk indicators:
  - 🔴 Red = High Risk (GLOF Alert)
  - 🟡 Yellow = Medium Risk (Warning)
  - 🟢 Green = Safe
- Alert notifications from authorities with timestamps

### Authority Dashboard (Full Access)
- **Real-Time Sensor Values**:
  - Lake water level rise (cm/day)
  - Lake water temperature (°C)
  - Air temperature (°C)
  - Sensor battery percentage
  - Sensor status (Active/Warning/Error)

- **Historical Data**: Past 7 days of sensor readings
- **Graph Visualization**: Chart.js line graphs with threshold indicators
- **Sensor Health Monitoring**: Battery status and sensor health
- **Alert System**: Send notifications to all public users

### Risk Classification Logic

#### Water Level Thresholds
- **SAFE**: Daily rise < 5 cm/day
- **WARNING**: Daily rise between 5–15 cm/day
- **DANGER**: Daily rise > 20 cm/day OR sudden spike > 10 cm within a few hours

#### Temperature Thresholds
- **SAFE**: Lake temperature 0–5°C AND Air temperature < 5°C
- **WARNING**: Air temperature between 5–10°C
- **DANGER**: Air temperature > 10°C for continuous days

#### Combined Risk
- **High Risk**: Water level in DANGER OR temperature in DANGER with rising water level
- **Medium Risk**: Moderate rise in water level or temperature
- **Safe**: Normal conditions

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project (optional - demo mode works without Firebase)

### Firebase Setup Required

**The application requires Firebase to be configured before use.**

1. **Quick Setup**: See `FIREBASE_SETUP.md` for detailed step-by-step instructions
2. **Update Config**: Edit `src/config/firebase.ts` with your Firebase credentials
3. **Enable Services**: Make sure Authentication and Firestore are enabled in Firebase Console

**Alternative - Demo Mode (Testing Only):**
- Set `DEMO_MODE = true` in `src/config/demoMode.ts` to use localStorage instead
- Demo mode is for testing only and data is stored locally in your browser

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Firebase**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Copy your Firebase config to `src/config/firebase.ts`

   Update `src/config/firebase.ts` with your Firebase credentials:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     // ... other config
   };
   ```

3. **Set up Firestore Collections**:
   The app will automatically create the following collections:
   - `users` - User profiles
   - `publicUsers` - Public user data
   - `sensorData` - Sensor readings
   - `alerts` - Alert notifications

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## Demo Credentials

### Public User Login
- **Phone Number**: Any valid format (e.g., +1234567890)
- **Password**: Any password (for demo, stored in Firestore)
- **OTP**: `123456` (mock OTP for demo)

### Authority Signup/Login
- Create an account using the Authority Signup page
- Use email and password to login

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── PublicLogin.tsx
│   │   ├── AuthorityLogin.tsx
│   │   └── AuthoritySignup.tsx
│   ├── dashboard/
│   │   ├── PublicDashboard.tsx
│   │   └── AuthorityDashboard.tsx
│   ├── profile/
│   │   └── Profile.tsx
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx
├── services/
│   ├── authService.ts
│   └── dataService.ts
├── utils/
│   ├── riskCalculation.ts
│   └── mockData.ts
├── types/
│   └── index.ts
├── config/
│   └── firebase.ts
├── App.tsx
└── main.tsx
```

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Firebase** - Authentication and Firestore database
- **React Router** - Client-side routing
- **Chart.js** - Data visualization
- **React Chart.js 2** - React wrapper for Chart.js

## Mock Data

The application includes a mock data generator for demonstration purposes. In production, sensor data would be collected from actual IoT sensors and stored in Firestore.

## Security Notes

- This is a demo application. For production use:
  - Implement proper Firebase Security Rules
  - Use Firebase Phone Authentication for public users
  - Add input validation and sanitization
  - Implement rate limiting
  - Add proper error handling and logging

## License

This project is created for demonstration purposes.
