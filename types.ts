
export interface PaperSummary {
  title: string;
  summary: string;
  difference: string;
  relevance: string;
  url: string;
  updatedDate: string;
  communityReaction: string;
}

export interface InfluencerMention {
  influencerName: string;
  role: string;
  title: string;
  summary: string;
  url: string;
  date: string;
}

export interface DeepDive {
  title: string;
  keyInnovation: string;
  detailedAnalysis: string;
  historicalContext: string;
  practicalImplication: string;
  url: string;
}

export interface DailyReport {
  date: string;
  generatedAt: number; // Unix timestamp in milliseconds
  topPapers: PaperSummary[];
  influencerMentions: InfluencerMention[];
  deepDive: DeepDive;
}

export enum AppStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
