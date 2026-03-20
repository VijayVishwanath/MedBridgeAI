export interface TriageReport {
  patientName: string;
  age: string;
  criticalityScore: number;
  primaryCondition: string;
  allergies: string[];
  medications: string[];
  summary: string;
  recommendedActions: string[];
  groundingSources: { uri: string; title: string }[];
  nearbyHospitals?: { name: string; uri: string }[];
}

export interface ImageAsset {
  file: File;
  preview: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export enum TriageStep {
  INTAKE = 'INTAKE',
  PROCESSING = 'PROCESSING',
  REPORT = 'REPORT'
}
