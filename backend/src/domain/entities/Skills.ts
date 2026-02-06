// Skill categories extracted from resume or job description
export interface ExtractedSkills {
  technicalSkills: string[];
  softSkills: string[];
  tools: string[];
  frameworks: string[];
  languages: string[];
}

export class Skills implements ExtractedSkills {
  technicalSkills: string[];
  softSkills: string[];
  tools: string[];
  frameworks: string[];
  languages: string[];

  constructor(data: Partial<ExtractedSkills> = {}) {
    this.technicalSkills = data.technicalSkills || [];
    this.softSkills = data.softSkills || [];
    this.tools = data.tools || [];
    this.frameworks = data.frameworks || [];
    this.languages = data.languages || [];
  }

  getAllSkills(): string[] {
    return [
      ...this.technicalSkills,
      ...this.softSkills,
      ...this.tools,
      ...this.frameworks,
      ...this.languages,
    ];
  }

  isEmpty(): boolean {
    return this.getAllSkills().length === 0;
  }
}
