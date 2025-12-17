import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { signInPublicUser, signInWithOTP } from '../../services/authService';

export function PublicLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (otpMode) {
        user = await signInWithOTP(phoneNumber, otp);
      } else {
        user = await signInPublicUser(phoneNumber, password);
      }
      
      setCurrentUser(user);
      navigate('/dashboard/public');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Public User Login</h2>
        <p className="subtitle">Access your Glacier Sentinel risk dashboard</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              required
            />
          </div>

          {!otpMode ? (
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label>OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
              <small>Demo OTP: 123456</small>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-links" style={{ marginTop: '16px' }}>
          {!otpMode ? (
            <>
              <button
                type="button"
                onClick={() => setOtpMode(true)}
                className="link-button"
              >
                Forgot Password? Recover access with OTP
              </button>
              <p style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280', lineHeight: '1.4', marginBottom: 0 }}>
                Use OTP if you can&apos;t remember your password. In production this would be sent via SMS.
              </p>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setOtpMode(false)}
              className="link-button"
            >
              Back to Password Login
            </button>
          )}
        </div>

        <div className="auth-links" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <Link to="/signup/public">Create Public Account</Link>
          <span style={{ margin: '0 8px', color: '#d1d5db' }}>•</span>
          <Link to="/login/authority">Authority Login</Link>
        </div>
      </div>
    </div>
  );
}

