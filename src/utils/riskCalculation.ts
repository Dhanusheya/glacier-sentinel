import type { SensorData, RiskLevel, RiskStatus } from '../types';

/**
 * Calculate risk level based on water level rise
 * SAFE: < 5 cm/day
 * WARNING: 5-15 cm/day
 * DANGER: > 20 cm/day OR sudden spike > 10 cm within a few hours
 */
export function calculateWaterLevelRisk(
  currentRise: number,
  previousRise?: number
): RiskLevel {
  // Check for sudden spike (more than 10cm increase from previous)
  if (previousRise !== undefined && currentRise - previousRise > 10) {
    return 'danger';
  }

  if (currentRise < 5) {
    return 'safe';
  } else if (currentRise >= 5 && currentRise <= 15) {
    return 'warning';
  } else if (currentRise > 20) {
    return 'danger';
  } else {
    // Between 15-20 cm/day
    return 'warning';
  }
}

/**
 * Calculate risk level based on temperature
 * SAFE: Lake temp 0-5°C AND Air temp < 5°C
 * WARNING: Air temp 5-10°C
 * DANGER: Air temp > 10°C for continuous days
 */
export function calculateTemperatureRisk(
  lakeTemp: number,
  airTemp: number,
  previousAirTemp?: number
): RiskLevel {
  // Check if air temp is continuously above 10°C
  if (previousAirTemp !== undefined && airTemp > 10 && previousAirTemp > 10) {
    return 'danger';
  }

  if (airTemp > 10) {
    return 'danger';
  } else if (airTemp >= 5 && airTemp <= 10) {
    return 'warning';
  } else if (lakeTemp >= 0 && lakeTemp <= 5 && airTemp < 5) {
    return 'safe';
  } else {
    return 'warning';
  }
}

/**
 * Calculate combined risk level
 * High Risk: Water level in DANGER OR temperature in DANGER with rising water level
 * Medium Risk: Moderate rise in water level or temperature
 * Safe: Normal conditions
 */
export function calculateCombinedRisk(
  waterLevelRisk: RiskLevel,
  temperatureRisk: RiskLevel
): RiskLevel {
  if (waterLevelRisk === 'danger' || temperatureRisk === 'danger') {
    return 'danger';
  } else if (waterLevelRisk === 'warning' || temperatureRisk === 'warning') {
    return 'warning';
  } else {
    return 'safe';
  }
}

/**
 * Calculate risk status for a given sensor data point
 */
export function calculateRiskStatus(
  currentData: SensorData,
  previousData?: SensorData
): RiskStatus {
  const waterLevelRisk = calculateWaterLevelRisk(
    currentData.waterLevelRise,
    previousData?.waterLevelRise
  );

  const temperatureRisk = calculateTemperatureRisk(
    currentData.lakeTemperature,
    currentData.airTemperature,
    previousData?.airTemperature
  );

  const combinedRisk = calculateCombinedRisk(
    waterLevelRisk,
    temperatureRisk
  );

  const date = new Date(currentData.timestamp).toLocaleDateString();

  return {
    level: combinedRisk,
    date,
    waterLevelRisk,
    temperatureRisk,
    combinedRisk,
  };
}

/**
 * Get risk level color
 */
export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'danger':
      return '#dc2626'; // Red
    case 'warning':
      return '#eab308'; // Yellow
    case 'safe':
      return '#22c55e'; // Green
    default:
      return '#6b7280'; // Gray
  }
}

/**
 * Get risk level emoji
 */
export function getRiskEmoji(risk: RiskLevel): string {
  switch (risk) {
    case 'danger':
      return '🔴';
    case 'warning':
      return '🟡';
    case 'safe':
      return '🟢';
    default:
      return '⚪';
  }
}

