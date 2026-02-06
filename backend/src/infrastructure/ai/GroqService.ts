import Groq from 'groq-sdk';
import { env } from '../../config';
import { ExtractedSkills, Skills } from '../../domain/entities';
import { SKILL_EXTRACTION_PROMPT, SUGGESTIONS_PROMPT } from './prompts';
import { logger } from '../logging/logger';

export class GroqService {
  private client = new Groq({ apiKey: env.GROQ_API_KEY });
  private model = 'llama-3.3-70b-versatile'; // Updated model

  async extractSkills(text: string): Promise<Skills> {
    try {
      const prompt = SKILL_EXTRACTION_PROMPT.replace('{{TEXT}}', text);
      const result = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2048,
      });

      const content = result.choices[0]?.message?.content?.trim();

      if (!content) {
        logger.warn('Empty response from Groq for skill extraction');
        return new Skills();
      }

      const parsed = this.parseJsonResponse<ExtractedSkills>(content);
      return new Skills(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Groq error';
      logger.error('Error extracting skills with Groq:', error);
      throw new Error(`Groq error: ${message}`);
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

      const result = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
      });

      const content = result.choices[0]?.message?.content?.trim();

      if (!content) {
        logger.warn('Empty response from Groq for suggestions');
        return ['Consider tailoring your resume to match the job description more closely.'];
      }

      return this.parseJsonResponse<string[]>(content);
    } catch (error) {
      logger.error('Error generating suggestions with Groq:', error);
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
      logger.error('Failed to parse Groq JSON response:', { content: cleanContent, error });
      throw new Error('Failed to parse AI response');
    }
  }
}
