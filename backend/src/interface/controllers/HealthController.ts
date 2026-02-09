import { Request, Response } from 'express';
import { env } from '../../config';

const providerModelMap: Record<string, string> = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.0-flash-lite',
  groq: 'llama-3.3-70b-versatile',
  mock: 'mock-provider',
};

export class HealthController {
  check = (req: Request, res: Response) => {
    const aiProvider = env.AI_PROVIDER;
    const aiModel = providerModelMap[aiProvider] || 'unknown';

    res.status(200).json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      aiProvider,
      aiModel,
    });
  };
}
