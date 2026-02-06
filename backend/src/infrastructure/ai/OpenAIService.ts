import OpenAI from 'openai';
import { env } from '../../config';
import { ExtractedSkills, Skills } from '../../domain/entities';
import { SKILL_EXTRACTION_PROMPT, SUGGESTIONS_PROMPT } from './prompts';
import { logger } from '../logging/logger';

export class OpenAIService {
  private client: OpenAI;
  private model: string = 'gpt-4o-mini';

  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async extractSkills(text: string): Promise<Skills> {
    try {
      const prompt = SKILL_EXTRACTION_PROMPT.replace('{{TEXT}}', text);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts skills from text and returns valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content?.trim();
      
      if (!content) {
        logger.warn('Empty response from OpenAI for skill extraction');
        return new Skills();
      }

      // Parse JSON response
      const parsed = this.parseJsonResponse<ExtractedSkills>(content);
      return new Skills(parsed);
    } catch (error) {
      logger.error('Error extracting skills with OpenAI:', error);
      throw new Error('Failed to extract skills from text');
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

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful career advisor that provides actionable resume improvement suggestions. Return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content?.trim();
      
      if (!content) {
        logger.warn('Empty response from OpenAI for suggestions');
        return ['Consider tailoring your resume to match the job description more closely.'];
      }

      return this.parseJsonResponse<string[]>(content);
    } catch (error) {
      logger.error('Error generating suggestions with OpenAI:', error);
      return ['Unable to generate suggestions at this time. Please try again.'];
    }
  }

  private parseJsonResponse<T>(content: string): T {
    // Remove markdown code blocks if present
    let cleanContent = content;
    if (content.startsWith('```json')) {
      cleanContent = content.slice(7);
    } else if (content.startsWith('```')) {
      cleanContent = content.slice(3);
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3);
    }
    cleanContent = cleanContent.trim();

    try {
      return JSON.parse(cleanContent) as T;
    } catch (error) {
      logger.error('Failed to parse JSON response:', { content: cleanContent, error });
      throw new Error('Failed to parse AI response');
    }
  }
}
