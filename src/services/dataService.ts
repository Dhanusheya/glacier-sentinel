import { collection, addDoc, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { SensorData, Alert } from '../types';
import { generateMockSensorData } from '../utils/mockData';
import { DEMO_MODE } from '../config/demoMode';

/**
 * Get sensor data from Firestore
 * Falls back to mock data if Firestore is empty or in demo mode
 */
export async function getSensorData(days: number = 7): Promise<SensorData[]> {
  if (DEMO_MODE || !db) {
    // Always use mock data in demo mode
    return generateMockSensorData(days);
  }

  try {
    const sensorRef = collection(db, 'sensorData');
    const q = query(sensorRef, orderBy('timestamp', 'desc'), limit(days));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Return mock data if no data exists
      return generateMockSensorData(days);
    }

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      timestamp: doc.data().timestamp?.toMillis?.() || doc.data().timestamp,
    })) as SensorData[];
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    // Fallback to mock data
    return generateMockSensorData(days);
  }
}

/**
 * Save sensor data to Firestore
 */
export async function saveSensorData(data: SensorData): Promise<void> {
  if (!db) {
    console.warn('Firebase not configured. Cannot save sensor data.');
    return;
  }

  try {
    await addDoc(collection(db, 'sensorData'), {
      ...data,
      timestamp: Timestamp.fromMillis(data.timestamp),
    });
  } catch (error) {
    console.error('Error saving sensor data:', error);
  }
}

const DEMO_ALERTS_KEY = 'glacier_sentinel_demo_alerts';

/**
 * Get alerts from Firestore or localStorage (demo mode)
 */
export async function getAlerts(limitCount: number = 10): Promise<Alert[]> {
  if (DEMO_MODE || !db) {
    // Use localStorage in demo mode
    const stored = localStorage.getItem(DEMO_ALERTS_KEY);
    const alerts: Alert[] = stored ? JSON.parse(stored) : [];
    return alerts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limitCount);
  }

  try {
    const alertsRef = collection(db, 'alerts');
    const q = query(alertsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toMillis?.() || doc.data().timestamp,
    })) as Alert[];
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

/**
 * Create a new alert
 */
export async function createAlert(
  message: string,
  createdBy: string
): Promise<void> {
  if (DEMO_MODE || !db) {
    // Use localStorage in demo mode
    const stored = localStorage.getItem(DEMO_ALERTS_KEY);
    const alerts: Alert[] = stored ? JSON.parse(stored) : [];
    const newAlert: Alert = {
      id: `alert_${Date.now()}`,
      message,
      createdBy,
      timestamp: Date.now(),
    };
    alerts.push(newAlert);
    localStorage.setItem(DEMO_ALERTS_KEY, JSON.stringify(alerts));
    return;
  }

  try {
    await addDoc(collection(db, 'alerts'), {
      message,
      createdBy,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
}