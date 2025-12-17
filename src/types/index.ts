export type UserRole = 'public' | 'authority';

export interface User {
  uid: string;
  email?: string;
  phoneNumber?: string;
  role: UserRole;
  name?: string;
  designation?: string;
}

export interface PublicUser extends User {
  role: 'public';
  phoneNumber: string;
}

export interface AuthorityUser extends User {
  role: 'authority';
  email: string;
  name: string;
  designation: string;
  phoneNumber: string;
}

export interface SensorData {
  timestamp: number;
  waterLevelRise: number; // cm/day
  lakeTemperature: number; // °C
  airTemperature: number; // °C
  sensorBattery: number; // percentage
  sensorStatus: 'active' | 'warning' | 'error';
}

export type RiskLevel = 'safe' | 'warning' | 'danger';

export interface RiskStatus {
  level: RiskLevel;
  date: string;
  waterLevelRisk: RiskLevel;
  temperatureRisk: RiskLevel;
  combinedRisk: RiskLevel;
}

export interface Alert {
  id: string;
  message: string;
  timestamp: number;
  createdBy: string;
}

