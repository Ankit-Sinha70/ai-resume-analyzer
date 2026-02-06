// Skill categories extracted from resume or job description
export interface ExtractedSkills {
  technicalSkills: string[];
  softSkills: string[];
  tools: string[];
  frameworks: string[];
  languages: string[];
}

// Resume entity
export interface Resume {
  id?: string;
  fileName: string;
  extractedText: string;
  skills: ExtractedSkills;
  uploadedAt: Date;
}

// Job description entity
export interface JobDescription {
  id?: string;
  rawText: string;
  skills: ExtractedSkills;
  createdAt: Date;
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

// API Request/Response types
export interface AnalyzeRequest {
  jobDescription: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

// API Error response
export interface ApiError {
  success: false;
  error: string;
  details?: string;
}
