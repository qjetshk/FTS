export interface StatformJobData {
  organizationId: string;
  ozonClientId: number;
  ozonApiKey: string;
  period: string; // 'YYYY-MM'
  triggeredBy: 'cron' | 'manual';
}

export interface ClassifyJobData {
  organizationId: string;
  ozonClientId: number;
  ozonApiKey: string;
}
