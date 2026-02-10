import { env } from '../../config';
import { Skills, QualityCheckResult } from '../../domain/entities';
import { OpenAIService } from './OpenAIService';

import { GeminiService } from './GeminiService';
import { GroqService } from './GroqService';

export class AIService {
  private provider = env.AI_PROVIDER;
  private openai?: OpenAIService;
  private gemini?: GeminiService;
  private groq?: GroqService;

  constructor() {
    if (this.provider === 'openai') {
      this.openai = new OpenAIService();
    }
    if (this.provider === 'gemini') {
      this.gemini = new GeminiService();
    }
    if (this.provider === 'groq') {
      this.groq = new GroqService();
    }
  }

  async extractSkills(text: string): Promise<Skills> {
    if (this.provider === 'openai' && this.openai) {
      return this.openai.extractSkills(text);
    }

    if (this.provider === 'gemini' && this.gemini) {
      return this.gemini.extractSkills(text);
    }

    if (this.provider === 'groq' && this.groq) {
      return this.groq.extractSkills(text);
    }

    // Mock provider for testing without billing
    return new Skills({
      technicalSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      softSkills: ['Communication', 'Problem Solving'],
      tools: ['Git', 'Docker'],
      frameworks: ['Express', 'Next.js'],
      languages: ['English'],
    });
  }

  async checkQuality(text: string): Promise<QualityCheckResult> {
    if (this.provider === 'openai' && this.openai) {
      return this.openai.checkQuality(text);
    }

    if (this.provider === 'gemini' && this.gemini) {
      return this.gemini.checkQuality(text);
    }

    if (this.provider === 'groq' && this.groq) {
      return this.groq.checkQuality(text);
    }

    // Mock provider
    return new QualityCheckResult({
      isSuitable: true,
      quality: 'good',
      issues: ['Mock quality check'],
      summary: 'This is a mock quality check result.',
    });
  }

  async generateSuggestions(

    resumeSkills: string[],
    jobSkills: string[],
    matchedSkills: string[],
    missingSkills: string[],
    matchPercentage: number
  ): Promise<string[]> {
    if (this.provider === 'openai' && this.openai) {
      return this.openai.generateSuggestions(
        resumeSkills,
        jobSkills,
        matchedSkills,
        missingSkills,
        matchPercentage
      );
    }

    if (this.provider === 'gemini' && this.gemini) {
      return this.gemini.generateSuggestions(
        resumeSkills,
        jobSkills,
        matchedSkills,
        missingSkills,
        matchPercentage
      );
    }

    if (this.provider === 'groq' && this.groq) {
      return this.groq.generateSuggestions(
        resumeSkills,
        jobSkills,
        matchedSkills,
        missingSkills,
        matchPercentage
      );
    }

    return [
      'Highlight your React and Node.js experience.',
      'Add recent projects demonstrating backend APIs.',
      'Mention cloud or container experience if applicable.',
    ];
  }
}
