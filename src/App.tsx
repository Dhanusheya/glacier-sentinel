import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicLogin } from './components/auth/PublicLogin';
import { PublicSignup } from './components/auth/PublicSignup';
import { AuthorityLogin } from './components/auth/AuthorityLogin';
import { AuthoritySignup } from './components/auth/AuthoritySignup';
import { PublicDashboard } from './components/dashboard/PublicDashboard';
import { AuthorityDashboard } from './components/dashboard/AuthorityDashboard';
import { Profile } from './components/profile/Profile';
import { DemoModeBanner } from './components/DemoModeBanner';
import { FirebaseCheck } from './components/FirebaseCheck';

function Unauthorized() {
  return (
    <div className="unauthorized-container">
      <h1>Unauthorized Access</h1>
      <p>You don't have permission to access this page.</p>
      <a href="/login">Go to Login</a>
    </div>
  );
}

function Home() {
  const { currentUser } = useAuth();
  
  if (currentUser) {
    if (currentUser.role === 'public') {
      return <Navigate to="/dashboard/public" replace />;
    } else {
      return <Navigate to="/dashboard/authority" replace />;
    }
  }
  
  return <Navigate to="/login/public" replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login/public" element={<PublicLogin />} />
        <Route path="/signup/public" element={<PublicSignup />} />
        <Route path="/login/authority" element={<AuthorityLogin />} />
        <Route path="/signup/authority" element={<AuthoritySignup />} />
        <Route
          path="/dashboard/public"
          element={
            <ProtectedRoute requiredRole="public">
              <PublicDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/authority"
          element={
            <ProtectedRoute requiredRole="authority">
              <AuthorityDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <FirebaseCheck>
      <AuthProvider>
        <DemoModeBanner />
        <AppRoutes />
      </AuthProvider>
    </FirebaseCheck>
  );
}

export default App;
