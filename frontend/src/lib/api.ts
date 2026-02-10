import axios from 'axios';
import { AnalyzeResponse, ProviderInfo, QualityCheckResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds for AI processing
});

export async function analyzeResume(
  file: File,
  jobDescription: string
): Promise<AnalyzeResponse> {
  try {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    const response = await api.post<AnalyzeResponse>('/api/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error || error.message;
      const friendly = formatError(message, status);
      return {
        success: false,
        error: friendly,
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

export async function checkResumeQuality(
  file: File
): Promise<QualityCheckResponse> {
  try {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.post<QualityCheckResponse>('/api/analyze/quality', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error || error.message;
      const friendly = formatError(message, status);
      return {
        success: false,
        error: friendly,
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred while checking resume quality.',
    };
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await api.get('/api/health');
    return response.data.success === true;
  } catch {
    return false;
  }
}

export async function getProviderInfo(): Promise<ProviderInfo | null> {
  try {
    const response = await api.get<ProviderInfo>('/api/health');
    return response.data;
  } catch (error) {
    return null;
  }
}

function formatError(message: string, status?: number): string {
  const normalized = message.toLowerCase();

  const isRateLimit =
    status === 429 ||
    normalized.includes('quota') ||
    normalized.includes('rate limit') ||
    normalized.includes('too many requests');

  if (isRateLimit) {
    return 'AI provider is temporarily rate-limited. Please wait a moment or switch providers, then try again.';
  }

  return message || 'An unexpected error occurred. Please try again.';
}
