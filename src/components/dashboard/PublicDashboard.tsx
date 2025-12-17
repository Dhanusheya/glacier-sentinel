import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { signOutUser } from '../../services/authService';
import { getSensorData, getAlerts } from '../../services/dataService';
import type { Alert } from '../../types';
import { calculateRiskStatus, getRiskColor, getRiskEmoji } from '../../utils/riskCalculation';

export function PublicDashboard() {
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [riskStatuses, setRiskStatuses] = useState<Array<{ 
    date: string; 
    risk: string; 
    color: string; 
    emoji: string;
    bgColor: string;
    message: string;
  }>>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Refresh alerts & risk view periodically to simulate push notifications
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const sensorData = await getSensorData(3); // Get last 3 days
      const alertsData = await getAlerts(10);

      const recent = sensorData.slice(-3);

      // Calculate risk for each day using only recent window
      const risks = recent.map((data, index) => {
        const previous = index > 0 ? recent[index - 1] : undefined;
        const riskStatus = calculateRiskStatus(data, previous);
        const riskLevel = riskStatus.combinedRisk;
        
        let bgColor, message;
        if (riskLevel === 'danger') {
          bgColor = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
          message = 'GLOF Alert - High Risk';
        } else if (riskLevel === 'warning') {
          bgColor = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
          message = 'Warning - Monitor Closely';
        } else {
          bgColor = 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
          message = 'Safe Conditions';
        }

        return {
          date: riskStatus.date,
          risk: riskLevel.toUpperCase(),
          color: getRiskColor(riskLevel),
          emoji: getRiskEmoji(riskLevel),
          bgColor,
          message,
        };
      });

      setRiskStatuses(risks.reverse()); // Show oldest to newest
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
    navigate('/login/public');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc',
      }}>
        <div style={{
          textAlign: 'center',
          color: '#64748b',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p>Loading risk status...</p>
        </div>
      </div>
    );
  }

  const labels = ['Today', 'Yesterday', 'Day Before Yesterday'];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '-0.5px',
            }}>
              Glacier Sentinel
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              opacity: 0.9,
              fontWeight: 400,
            }}>
              Glacial Lake Risk Status
            </p>
          </div>
          <Link
            to="/profile"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: 'white',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 20px',
      }}>
        {/* Risk Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px',
        }}>
          {riskStatuses.map((status, index) => {
            const isDanger = status.risk === 'DANGER';
            const isWarning = status.risk === 'WARNING';

            return (
              <div
                key={index}
                style={{
                  background: status.bgColor,
                  borderRadius: '20px',
                  padding: '32px 24px',
                  boxShadow: isDanger 
                    ? '0 8px 24px rgba(220, 38, 38, 0.2)' 
                    : isWarning
                    ? '0 8px 24px rgba(234, 179, 8, 0.15)'
                    : '0 8px 24px rgba(34, 197, 94, 0.15)',
                  border: `2px solid ${status.color}40`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Decorative circle */}
                <div style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: `${status.color}15`,
                }} />

                {/* Day Label */}
                <div style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: status.color,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '12px',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {labels[index] || status.date}
                </div>

                {/* Risk Emoji */}
                <div style={{
                  fontSize: '64px',
                  marginBottom: '16px',
                  position: 'relative',
                  zIndex: 1,
                  lineHeight: 1,
                }}>
                  {status.emoji}
                </div>

                {/* Risk Level */}
                <div style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: status.color,
                  marginBottom: '8px',
                  position: 'relative',
                  zIndex: 1,
                  letterSpacing: '-0.5px',
                }}>
                  {status.risk}
                </div>

                {/* Message */}
                <div style={{
                  fontSize: '14px',
                  color: '#475569',
                  fontWeight: 500,
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {status.message}
                </div>

                {/* Warning Icon for Danger */}
                {isDanger && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(220, 38, 38, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="24" height="24" fill="none" stroke="#dc2626" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Notifications Section */}
        <section style={{
          background: 'white',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
            }}>
              <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h2 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              color: '#1e293b',
            }}>
              Alert Notifications
            </h2>
          </div>

          {alerts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#94a3b8',
            }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 16px', opacity: 0.5 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 500 }}>
                No alerts at this time. Stay safe!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px',
                    borderLeft: '4px solid #667eea',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{
                    fontSize: '15px',
                    color: '#1e293b',
                    fontWeight: 500,
                    marginBottom: '8px',
                    lineHeight: 1.6,
                  }}>
                    {alert.message}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(alert.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Logout Button */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
        }}>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '12px 24px',
              color: '#64748b',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#94a3b8';
              e.currentTarget.style.color = '#475569';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Add CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

