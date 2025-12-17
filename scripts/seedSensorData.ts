import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// TODO: Replace these values with your real Firebase web app config
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'your-project-id.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project-id.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  console.log('Seeding sensorData (last 7 days)…');

  for (let i = 7; i >= 0; i--) {
    const ts = now - i * oneDay;

    const waterLevelRise = 3 + Math.random() * 10; // cm/day
    const lakeTemperature = 1 + Math.random() * 5; // °C
    const airTemperature = 2 + Math.random() * 12; // °C
    const sensorBattery = 60 + Math.random() * 40; // %
    const sensorStatus: 'active' | 'warning' | 'error' =
      sensorBattery > 30 ? 'active' : sensorBattery > 15 ? 'warning' : 'error';

    await addDoc(collection(db, 'sensorData'), {
      timestamp: Timestamp.fromMillis(ts),
      waterLevelRise: Math.round(waterLevelRise * 10) / 10,
      lakeTemperature: Math.round(lakeTemperature * 10) / 10,
      airTemperature: Math.round(airTemperature * 10) / 10,
      sensorBattery: Math.round(sensorBattery),
      sensorStatus,
    });
  }

  console.log('Seed complete.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

