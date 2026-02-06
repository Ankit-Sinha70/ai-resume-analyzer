'use client';

import { useEffect, useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { JobDescriptionInput } from '@/components/JobDescriptionInput';
import { analyzeResume, getProviderInfo } from '@/lib/api';
import { AnalysisResult, ProviderInfo } from '@/types';
import { FileText, Briefcase, Sparkles, Loader2 } from 'lucide-react';
import { AnalysisResults } from '@/components/AnalysisResults';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null);

  useEffect(() => {
    getProviderInfo().then((info) => {
      if (info) setProviderInfo(info);
    });
  }, []);

  const handleAnalyze = async () => {
    const validation = validateInputs(file, jobDescription);
    if (validation) {
      setError(validation);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeResume(file as File, jobDescription);
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription('');
    setResult(null);
    setError(null);
    setFileError('');
  };

  const validateInputs = (resume: File | null, description: string): string | null => {
    if (!resume) return 'Please upload a PDF resume (max 10MB).';
    if (resume.type !== 'application/pdf') return 'Only PDF files are allowed.';
    if (resume.size > 10 * 1024 * 1024) return 'File is too large. Max size is 10MB.';
    if (!description.trim()) return 'Please provide a job description.';
    if (description.trim().length < 50) return 'Job description is too short (minimum 50 characters).';
    return null;
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Sparkles className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Resume Analyzer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your resume and paste a job description to see how well you match.
            Get actionable suggestions to improve your chances.
          </p>
          {providerInfo && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm text-primary-700">
              <span className="font-semibold">Provider:</span>
              <span className="uppercase">{providerInfo.aiProvider}</span>
              <span className="text-gray-500">({providerInfo.aiModel})</span>
            </div>
          )}
        </div>

        {/* Main Content */}
        {!result ? (
          <div className="space-y-8">
            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Upload Your Resume
                </h2>
              </div>
              <FileUpload
                file={file}
                onFileChange={setFile}
                onError={(msg) => {
                  setFileError(msg);
                  if (msg) setError(msg);
                }}
                error={fileError}
                disabled={isLoading}
              />
            </div>

            {/* Job Description Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Job Description
                </h2>
              </div>
              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Analyze Button */}
            <div className="flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !file || !jobDescription.trim()}
                className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg
                         hover:bg-primary-700 focus:outline-none focus:ring-2 
                         focus:ring-primary-500 focus:ring-offset-2
                         disabled:bg-gray-400 disabled:cursor-not-allowed
                         transition-colors duration-200 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Resume
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <AnalysisResults result={result} />
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg
                         hover:bg-gray-300 focus:outline-none focus:ring-2 
                         focus:ring-gray-500 focus:ring-offset-2
                         transition-colors duration-200"
              >
                Analyze Another Resume
              </button>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </main>
  );
}
