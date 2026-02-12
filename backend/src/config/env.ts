import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  AI_PROVIDER: z.enum(['openai', 'gemini', 'groq', 'mock']).default('openai'),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

const env = parsed.data;

if (env.AI_PROVIDER === 'openai' && !env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required when AI_PROVIDER is set to openai');
}

if (env.AI_PROVIDER === 'gemini' && !env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required when AI_PROVIDER is set to gemini');
}

if (env.AI_PROVIDER === 'groq' && !env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is required when AI_PROVIDER is set to groq');
}

export { env };
