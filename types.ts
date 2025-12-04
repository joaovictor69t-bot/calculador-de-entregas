export type WorkMode = 'NORMAL' | 'DAILY';

export interface BaseRecord {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  mode: WorkMode;
  totalValue: number;
  photoUrls: string[]; // Base64 strings
  timestamp: number;
}

export interface NormalRecord extends BaseRecord {
  mode: 'NORMAL';
  parcelCount: number;
  collectionCount: number;
  routeId: string;
}

export interface DailyRecord extends BaseRecord {
  mode: 'DAILY';
  numberOfIds: 1 | 2;
  routeIds: string[]; // Can be 1 or 2 IDs
  parcelCount: number; // Used for tier calculation
  tierLabel: string; // e.g., "Etapa 1", "Etapa 3"
}

export type WorkRecord = NormalRecord | DailyRecord;

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  NEW_ENTRY = 'NEW_ENTRY',
  HISTORY = 'HISTORY',
}

// Stats for charts
export interface DayStat {
  date: string; // DD/MM
  value: number;
}