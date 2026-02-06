'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { JobDescriptionInput } from '@/components/JobDescriptionInput';
import { AnalysisResults } from '@/components/AnalysisResults';
import { analyzeResume } from '@/lib/api';
import { AnalysisResult } from '@/types';
import { FileText, Briefcase, Sparkles } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!file || !jobDescription.trim()) {
      setError('Please upload a resume and provide a job description');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeResume(file, jobDescription);
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
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
    </main>
  );
}
