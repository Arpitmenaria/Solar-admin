export type ChartPeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface SolarChartDataPoint {
  label: string;
  generation: number;    // kWh or MWh
  gridExport: number;    // kWh or MWh
  consumption: number;   // kWh or MWh
}

export type SolarPlantStatus = "OPTIMAL" | "NORMAL" | "WARNING" | "MAINTENANCE";

export interface SolarPlant {
  id: string;
  name: string;
  location: string;
  capacityKwp: number;
  currentOutputKw: number;
  efficiency: number;
  status: SolarPlantStatus;
  invertersCount: number;
  installedDate: string;
  gridStatus: "Synchronized" | "Islanding" | "Standby";
}

export interface SolarStats {
  totalGenerationMwh: number;
  dailyGenerationKwh: number;
  activeInverters: number;
  totalInverters: number;
  gridExportMwh: number;
  co2SavedTons: number;
  peakPowerKw: number;
  efficiencyPercent: number;
  batteryStoragePercent: number;
  solarIrradiance: number; // W/m²
  estimatedRevenue: number;
  monthlySavings: number;
}

export type SolarNotificationSeverity = "info" | "success" | "warning" | "alert";

export interface SolarNotification {
  id: string;
  title: string;
  message: string;
  severity: SolarNotificationSeverity;
  read: boolean;
  timestamp: string;
}
