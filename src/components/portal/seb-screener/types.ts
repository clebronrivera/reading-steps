export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface SEBQuestion {
  id: string;
  question: string;
  isRedFlag?: boolean;
}

export interface SEBCategory {
  id: string;
  title: string;
  description: string;
  questions: SEBQuestion[];
}

export interface SEBCombinedCategory {
  id: string;
  title: string;
  description: string;
  subcategories: string[];
}

export interface SEBScoreResult {
  meanScore: number;
  riskLevel: RiskLevel;
  topItems: { question: string; score: number }[];
}

export interface SEBCategoryResult extends SEBScoreResult {
  categoryId: string;
  categoryTitle: string;
}

export interface SEBOverallResult {
  overallRisk: RiskLevel;
  categoryResults: SEBCategoryResult[];
  specificAreaResults: Record<string, SEBScoreResult>;
  redFlagTriggered: boolean;
  redFlagItems: string[];
}

// Brief screener types
export interface BriefSEBResponse {
  safety_behavior: number;
  attention_self_control: number;
  feelings_stress: number;
  social_connection: number;
  flexibility_independence: number;
  repetitive_unusual: number;
}

export interface BriefSEBResult {
  categoryScores: Record<string, { score: number; risk: RiskLevel }>;
  overallRisk: RiskLevel;
  requiresFollowUp: string[];
}
