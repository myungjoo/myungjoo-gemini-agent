
export interface PaperSummary {
  title: string;
  summary: string;
  difference: string;
  relevance: string;
  url: string;
}

export interface DeepDive {
  title: string;
  keyInnovation: string;
  detailedAnalysis: string;
  historicalContext: string;
  practicalImplication: string;
}

export interface DailyReport {
  date: string;
  topPapers: PaperSummary[];
  deepDive: DeepDive;
}

export enum AppStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
