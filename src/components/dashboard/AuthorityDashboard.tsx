import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { useAuth } from '../../contexts/AuthContext';
import { signOutUser } from '../../services/authService';
import { getSensorData, getAlerts, createAlert } from '../../services/dataService';
import type { SensorData, Alert } from '../../types';



ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

export function AuthorityDashboard() {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const sensorData = await getSensorData(7);
      const alertsData = await getAlerts(10);

      setCurrentData(sensorData[sensorData.length - 1]);
      setHistoricalData(sensorData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndicator = (value: number, type: 'water' | 'temp') => {
    if (type === 'water') {
      if (value >= 20) return { status: 'Danger', color: '#dc2626', bg: '#fee2e2' };
      if (value >= 5) return { status: 'Warning', color: '#eab308', bg: '#fef3c7' };
      return { status: 'Normal', color: '#22c55e', bg: '#d1fae5' };
    } else {
      if (value > 10) return { status: 'Danger', color: '#dc2626', bg: '#fee2e2' };
      if (value >= 5) return { status: 'Warning', color: '#eab308', bg: '#fef3c7' };
      return { status: 'Normal', color: '#22c55e', bg: '#d1fae5' };
    }
  };

  const handleSendAlert = async () => {
    if (!alertMessage.trim() || !currentUser) return;

    try {
      await createAlert(alertMessage, currentUser.name || currentUser.uid);
      setAlertMessage('');
      setShowAlertModal(false);
      await loadData();
    } catch (error) {
      console.error('Error sending alert:', error);
      alert('Failed to send alert');
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
    navigate('/login/authority');
  };

  if (loading || !currentData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc',
      }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p>Loading sensor data...</p>
        </div>
      </div>
    );
  }

  
  const lakeTempStatus = getStatusIndicator(currentData.lakeTemperature, 'temp');
  const airTempStatus = getStatusIndicator(currentData.airTemperature, 'temp');
  const waterStatus = getStatusIndicator(currentData.waterLevel ?? 0, 'water');


  // Prepare chart data
  const labels = historicalData.map((d) => {
    const date = new Date(d.timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Water Level Rise (cm/day)',
        data: historicalData.map((d) => d.waterLevelRise),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Lake Temperature (°C)',
        data: historicalData.map((d) => d.lakeTemperature),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        yAxisID: 'y1',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Air Temperature (°C)',
        data: historicalData.map((d) => d.airTemperature),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        yAxisID: 'y1',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13, weight: 600 as number},
        bodyFont: { size: 12 },
      },
      annotation: {
        annotations: {
          warningLine: {
            type: 'line' as const,
            yMin: 5,
            yMax: 5,
            borderColor: '#eab308',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: 'Warning (5 cm/day)',
              position: 'end' as const,
              backgroundColor: '#eab308',
              color: 'white',
              font: { size: 10, weight: 600 as number},
              padding: 4,
            },
            yAxisID: 'y',
          },
          dangerLine: {
            type: 'line' as const,
            yMin: 20,
            yMax: 20,
            borderColor: '#dc2626',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: 'Danger (20 cm/day)',
              position: 'end' as const,
              backgroundColor: '#dc2626',
              color: 'white',
              font: { size: 10, weight: 600 as number},
              padding: 4,
            },
            yAxisID: 'y',
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11 },
          color: '#64748b',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Water Level Rise (cm/day)',
          font: { size: 12, weight: 600 as number},
          color: '#475569',
        },
        grid: {
          color: '#e2e8f0',
        },
        ticks: {
          font: { size: 11 },
          color: '#64748b',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Temperature (°C)',
          font: { size: 12, weight: 600 as number},
          color: '#475569',
        },
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11 },
          color: '#64748b',
        },
      },
    },
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'sensors', label: 'Sensors', icon: '📡' },
    { id: 'alerts', label: 'Alerts', icon: '🔔' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: '#1e293b',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #334155',
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 700,
            color: 'white',
          }}>
            Glacier Sentinel
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '12px',
            color: '#94a3b8',
          }}>
            Authority Dashboard
          </p>
        </div>

        <nav style={{
          flex: 1,
          padding: '16px 0',
        }}>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'profile') {
                  navigate('/profile');
                } else {
                  setActiveTab(item.id);
                }
              }}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: activeTab === item.id ? '#334155' : 'transparent',
                border: 'none',
                color: activeTab === item.id ? 'white' : '#cbd5e1',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: (activeTab === item.id ? 600 : 400) as number,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.backgroundColor = '#334155';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #334155',
        }}>
          <div style={{
            fontSize: '12px',
            color: '#94a3b8',
            marginBottom: '8px',
          }}>
            Logged in as
          </div>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'white',
            marginBottom: '12px',
          }}>
            {currentUser?.name || currentUser?.email || 'Authority User'}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#dc2626';
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: '260px',
        padding: '32px',
      }}>
        {/* Top Header */}
        <div style={{
          marginBottom: '32px',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '8px',
          }}>
            {activeTab === 'dashboard' && 'Monitoring Dashboard'}
            {activeTab === 'sensors' && 'Sensor Management'}
            {activeTab === 'alerts' && 'Alert System'}
          </h2>
          <p style={{
            margin: 0,
            color: '#64748b',
            fontSize: '14px',
          }}>
            {activeTab === 'dashboard' && 'Real-time sensor data and risk assessment'}
            {activeTab === 'sensors' && 'Sensor health and status monitoring'}
            {activeTab === 'alerts' && 'Send notifications to public users'}
          </p>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Metric Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '32px',
            }}>
              {/* Water Level Card */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: `2px solid ${waterStatus.color}40`,
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                }}>
                  <div>
                    <div style={{
                      fontSize: '13px',
                      color: '#64748b',
                      fontWeight: 500,
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Lake Water Level Rise
                    </div>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 700,
                      color: '#1e293b',
                    }}>
                      {currentData.waterLevelRise}
                      <span style={{
                        fontSize: '18px',
                        fontWeight: 400,
                        color: '#64748b',
                        marginLeft: '4px',
                      }}>cm/day</span>
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: waterStatus.bg,
                    color: waterStatus.color,
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    {waterStatus.status}
                  </div>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                }}>
                  Threshold: Warning (5), Danger (20)
                </div>
              </div>

              {/* Lake Temperature Card */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: `2px solid ${lakeTempStatus.color}40`,
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                }}>
                  <div>
                    <div style={{
                      fontSize: '13px',
                      color: '#64748b',
                      fontWeight: 500,
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Lake Water Temperature
                    </div>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 700,
                      color: '#1e293b',
                    }}>
                      {currentData.lakeTemperature}
                      <span style={{
                        fontSize: '18px',
                        fontWeight: 400,
                        color: '#64748b',
                        marginLeft: '4px',
                      }}>°C</span>
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: lakeTempStatus.bg,
                    color: lakeTempStatus.color,
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    {lakeTempStatus.status}
                  </div>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                }}>
                  Safe range: 0-5°C
                </div>
              </div>

              {/* Air Temperature Card */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: `2px solid ${airTempStatus.color}40`,
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                }}>
                  <div>
                    <div style={{
                      fontSize: '13px',
                      color: '#64748b',
                      fontWeight: 500,
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Air Temperature
                    </div>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 700,
                      color: '#1e293b',
                    }}>
                      {currentData.airTemperature}
                      <span style={{
                        fontSize: '18px',
                        fontWeight: 400,
                        color: '#64748b',
                        marginLeft: '4px',
                      }}>°C</span>
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: airTempStatus.bg,
                    color: airTempStatus.color,
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    {airTempStatus.status}
                  </div>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                }}>
                  Danger threshold: &gt;10°C

                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '32px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1e293b',
                }}>
                  Historical Data (Last 7 Days)
                </h3>
                <div style={{
                  fontSize: '12px',
                  color: '#64748b',
                }}>
                  Auto-refresh: 30s
                </div>
              </div>
              <div style={{ height: '400px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Sensor Health Panel */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '18px',
                fontWeight: 600,
                color: '#1e293b',
              }}>
                Sensor Health Monitoring
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
              }}>
                <div>
                  <div style={{
                    fontSize: '13px',
                    color: '#64748b',
                    marginBottom: '12px',
                    fontWeight: 500,
                  }}>
                    Battery Level
                  </div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: '8px',
                  }}>
                    {currentData.sensorBattery}%
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${currentData.sensorBattery}%`,
                      height: '100%',
                      backgroundColor:
                        currentData.sensorBattery > 30
                          ? '#22c55e'
                          : currentData.sensorBattery > 15
                          ? '#eab308'
                          : '#dc2626',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '13px',
                    color: '#64748b',
                    marginBottom: '12px',
                    fontWeight: 500,
                  }}>
                    Sensor Status
                  </div>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    backgroundColor:
                      currentData.sensorStatus === 'active'
                        ? '#d1fae5'
                        : currentData.sensorStatus === 'warning'
                        ? '#fef3c7'
                        : '#fee2e2',
                    color:
                      currentData.sensorStatus === 'active'
                        ? '#166534'
                        : currentData.sensorStatus === 'warning'
                        ? '#854d0e'
                        : '#991b1b',
                    fontSize: '14px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    {currentData.sensorStatus}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '13px',
                    color: '#64748b',
                    marginBottom: '12px',
                    fontWeight: 500,
                  }}>
                    Last Updated
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#1e293b',
                    fontWeight: 500,
                  }}>
                    {new Date(currentData.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sensors Tab */}
        {activeTab === 'sensors' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <p style={{ color: '#64748b' }}>Sensor management features coming soon...</p>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '18px',
                fontWeight: 600,
                color: '#1e293b',
              }}>
                Send Alert
              </h3>
              <textarea
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="Enter alert message to send to all public users..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  marginBottom: '16px',
                }}
              />
              <button
                onClick={() => setShowAlertModal(true)}
                disabled={!alertMessage.trim()}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: alertMessage.trim() ? '#dc2626' : '#cbd5e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: alertMessage.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (alertMessage.trim()) {
                    e.currentTarget.style.background = '#b91c1c';
                  }
                }}
                onMouseLeave={(e) => {
                  if (alertMessage.trim()) {
                    e.currentTarget.style.background = '#dc2626';
                  }
                }}
              >
                Send Alert
              </button>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '18px',
                fontWeight: 600,
                color: '#1e293b',
              }}>
                Recent Alerts
              </h3>
              {alerts.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>No alerts sent yet.</p>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                }}>
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      style={{
                        padding: '16px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        borderLeft: '3px solid #dc2626',
                      }}
                    >
                      <div style={{
                        fontSize: '14px',
                        color: '#1e293b',
                        marginBottom: '8px',
                        fontWeight: 500,
                      }}>
                        {alert.message}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#64748b',
                      }}>
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Alert Confirmation Modal */}
      {showAlertModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={() => setShowAlertModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '20px',
              fontWeight: 700,
              color: '#1e293b',
            }}>
              Confirm Alert
            </h3>
            <p style={{
              margin: '0 0 20px 0',
              color: '#64748b',
              fontSize: '14px',
              lineHeight: 1.6,
            }}>
              This alert will be sent to all public users. Are you sure you want to proceed?
            </p>
            <div style={{
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              color: '#1e293b',
            }}>
              {alertMessage}
            </div>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setShowAlertModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendAlert}
                style={{
                  padding: '10px 20px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Send Alert
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

