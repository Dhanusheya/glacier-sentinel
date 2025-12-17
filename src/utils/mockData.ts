import type { SensorData } from '../types';

/**
 * Generate mock sensor data for demonstration
 */
export function generateMockSensorData(daysBack: number = 7): SensorData[] {
  const data: SensorData[] = [];
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  for (let i = daysBack; i >= 0; i--) {
    const timestamp = now - i * oneDay;
    
    // Generate realistic variations
    const baseWaterLevel = 3 + Math.sin(i * 0.5) * 2 + Math.random() * 2;
    const baseLakeTemp = 2 + Math.sin(i * 0.3) * 1.5 + Math.random() * 1;
    const baseAirTemp = 3 + Math.sin(i * 0.4) * 2 + Math.random() * 2;
    
    // Occasionally create warning/danger scenarios
    let waterLevelRise = baseWaterLevel;
    let airTemp = baseAirTemp;
    
    if (i === 0) {
      // Today: simulate a warning scenario
      waterLevelRise = 8 + Math.random() * 2;
      airTemp = 7 + Math.random() * 2;
    } else if (i === 1) {
      // Yesterday: safe
      waterLevelRise = 3 + Math.random() * 1;
      airTemp = 4 + Math.random() * 1;
    } else if (i === 2) {
      // Day before: safe
      waterLevelRise = 2 + Math.random() * 1;
      airTemp = 3 + Math.random() * 1;
    }

    const sensorBattery = Math.max(20, 100 - i * 2 + Math.random() * 5);
    const sensorStatus: 'active' | 'warning' | 'error' = 
      sensorBattery > 30 ? 'active' : sensorBattery > 15 ? 'warning' : 'error';

    data.push({
      timestamp,
      waterLevelRise: Math.round(waterLevelRise * 10) / 10,
      lakeTemperature: Math.round(baseLakeTemp * 10) / 10,
      airTemperature: Math.round(airTemp * 10) / 10,
      sensorBattery: Math.round(sensorBattery),
      sensorStatus,
    });
  }

  return data;
}

/**
 * Get current sensor data (most recent)
 */
export function getCurrentSensorData(): SensorData {
  const allData = generateMockSensorData(0);
  return allData[allData.length - 1];
}

