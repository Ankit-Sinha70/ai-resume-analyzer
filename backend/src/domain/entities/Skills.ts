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
    this.technicalSkills = this.normalizeList(data.technicalSkills);
    this.softSkills = this.normalizeList(data.softSkills);
    this.tools = this.normalizeList(data.tools);
    this.frameworks = this.normalizeList(data.frameworks);
    this.languages = this.normalizeList(data.languages);
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

  private normalizeList(list?: string[]): string[] {
    if (!list || list.length === 0) return [];
    const seen = new Set<string>();
    const cleaned: string[] = [];

    for (const item of list) {
      if (!item) continue;
      const trimmed = item.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      cleaned.push(trimmed);
    }

    return cleaned;
  }
}
