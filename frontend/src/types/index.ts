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
}

// API Response types
export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}
