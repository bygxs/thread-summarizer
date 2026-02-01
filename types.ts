export interface SummaryResult {
  narrative: string;
  technical: string;
}

export interface Stats {
  wordCount: number;
  charCount: number;
  tokenCountEstimate: number;
}

export enum SummaryView {
  NARRATIVE = 'NARRATIVE',
  TECHNICAL = 'TECHNICAL'
}

export interface SavedSummary extends SummaryResult {
  id: number;
  timestamp: number;
  stats: Stats;
  title: string;
  originalText: string;
}

export type AppView = 'HOME' | 'HISTORY';