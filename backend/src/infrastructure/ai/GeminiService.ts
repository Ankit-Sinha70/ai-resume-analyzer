import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config';
import { ExtractedSkills, Skills } from '../../domain/entities';
import { SKILL_EXTRACTION_PROMPT, SUGGESTIONS_PROMPT } from './prompts';
import { logger } from '../logging/logger';

export class GeminiService {
  private client = new GoogleGenerativeAI(env.GEMINI_API_KEY as string);
  private model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

  async extractSkills(text: string): Promise<Skills> {
    try {
      const prompt = SKILL_EXTRACTION_PROMPT.replace('{{TEXT}}', text);
      const result = await this.model.generateContent(prompt);
      const content = result.response.text()?.trim();

      if (!content) {
        logger.warn('Empty response from Gemini for skill extraction');
        return new Skills();
      }

      const parsed = this.parseJsonResponse<ExtractedSkills>(content);
      return new Skills(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Gemini error';
      logger.error('Error extracting skills with Gemini:', error);
      throw new Error(`Gemini error: ${message}`);
    }
  }

  async generateSuggestions(
    resumeSkills: string[],
    jobSkills: string[],
    matchedSkills: string[],
    missingSkills: string[],
    matchPercentage: number
  ): Promise<string[]> {
    try {
      const prompt = SUGGESTIONS_PROMPT
        .replace('{{RESUME_SKILLS}}', JSON.stringify(resumeSkills))
        .replace('{{JOB_SKILLS}}', JSON.stringify(jobSkills))
        .replace('{{MATCHED_SKILLS}}', JSON.stringify(matchedSkills))
        .replace('{{MISSING_SKILLS}}', JSON.stringify(missingSkills))
        .replace('{{MATCH_PERCENTAGE}}', matchPercentage.toString());

      const result = await this.model.generateContent(prompt);
      const content = result.response.text()?.trim();

      if (!content) {
        logger.warn('Empty response from Gemini for suggestions');
        return ['Consider tailoring your resume to match the job description more closely.'];
      }

      return this.parseJsonResponse<string[]>(content);
    } catch (error) {
      logger.error('Error generating suggestions with Gemini:', error);
      return ['Unable to generate suggestions at this time. Please try again.'];
    }
  }

  private parseJsonResponse<T>(content: string): T {
    let cleanContent = content;
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.slice(7);
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3);
    }
    cleanContent = cleanContent.trim();

    try {
      return JSON.parse(cleanContent) as T;
    } catch (error) {
      logger.error('Failed to parse Gemini JSON response:', { content: cleanContent, error });
      throw new Error('Failed to parse AI response');
    }
  }
}
