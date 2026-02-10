// Skill categories extracted from resume or job description
export interface ExtractedSkills {
  technicalSkills: string[];
  softSkills: string[];
  tools: string[];
  frameworks: string[];
  languages: string[];
}

// Analysis result with match data
export interface AnalysisResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  additionalSkills: string[];
  suggestions: string[];
  resumeSkills: ExtractedSkills;
  jobSkills: ExtractedSkills;
  matchedSkillDetails: SkillDetail[];
  missingSkillDetails: SkillDetail[];
}

// API Response types
export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

export interface SkillDetail {
  skill: string;
  rationale: string;
}

export interface ProviderInfo {
  success: boolean;
  aiProvider: string;
  aiModel: string;
}

export interface QualityCheckResult {
  isSuitable: boolean;
  quality: 'excellent' | 'good' | 'average' | 'poor';
  issues: string[];
  summary: string;
}

export interface QualityCheckResponse {
  success: boolean;
  data?: QualityCheckResult;
  error?: string;
}
