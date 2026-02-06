import { Skills, ExtractedSkills } from './Skills';

export interface AnalysisResultData {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  additionalSkills: string[];
  suggestions: string[];
  resumeSkills: ExtractedSkills;
  jobSkills: ExtractedSkills;
}

export class AnalysisResult implements AnalysisResultData {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  additionalSkills: string[];
  suggestions: string[];
  resumeSkills: ExtractedSkills;
  jobSkills: ExtractedSkills;

  constructor(data: AnalysisResultData) {
    this.matchPercentage = data.matchPercentage;
    this.matchedSkills = data.matchedSkills;
    this.missingSkills = data.missingSkills;
    this.additionalSkills = data.additionalSkills;
    this.suggestions = data.suggestions;
    this.resumeSkills = data.resumeSkills;
    this.jobSkills = data.jobSkills;
  }

  isGoodMatch(): boolean {
    return this.matchPercentage >= 70;
  }

  toJSON(): AnalysisResultData {
    return {
      matchPercentage: this.matchPercentage,
      matchedSkills: this.matchedSkills,
      missingSkills: this.missingSkills,
      additionalSkills: this.additionalSkills,
      suggestions: this.suggestions,
      resumeSkills: this.resumeSkills,
      jobSkills: this.jobSkills,
    };
  }
}
