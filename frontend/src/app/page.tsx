'use client';

import { useEffect, useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { JobDescriptionInput } from '@/components/JobDescriptionInput';
import { analyzeResume, getProviderInfo } from '@/lib/api';
import { AnalysisResult, ProviderInfo } from '@/types';
import { FileText, Briefcase, Sparkles, Loader2 } from 'lucide-react';
import { AnalysisResults } from '@/components/AnalysisResults';
import { motion } from 'framer-motion';

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
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-blob mix-blend-multiply filter" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-blob delay-2000 mix-blend-multiply filter" />
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-blob delay-4000 mix-blend-multiply filter" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-full mb-6 shadow-sm">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold tracking-wide uppercase">
              New
            </span>
            <span className="ml-2 text-sm text-gray-600 font-medium pr-2">
              AI-Powered Analysis V2.0
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight font-heading">
            Optimize your resume with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">AI Precision</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Stop guessing. Upload your resume and job description to get a detailed Match Score
            and actionable feedback to land the interview.
          </p>

          {providerInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/50 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>Powered by </span>
              <span className="font-semibold text-gray-900 uppercase">{providerInfo?.aiProvider}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Main Content */}
        {!result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="grid md:grid-cols-1 gap-8">
              {/* Upload Section */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 dark:border-gray-700 p-8 transition-all duration-300 hover:shadow-2xl hover:bg-white/80 dark:hover:bg-gray-800/90">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">
                      1. Upload Your Resume
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">PDF format, max 10MB</p>
                  </div>
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
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 dark:border-gray-700 p-8 transition-all duration-300 hover:shadow-2xl hover:bg-white/80 dark:hover:bg-gray-800/90">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                    <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">
                      2. Add Job Description
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Paste the job requirements here</p>
                  </div>
                </div>
                <JobDescriptionInput
                  value={jobDescription}
                  onChange={setJobDescription}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-red-200 bg-red-50/90 backdrop-blur-sm px-6 py-4 text-sm text-red-700 shadow-sm flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-red-500" />
                {error}
              </motion.div>
            )}

            {/* Analyze Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !file || !jobDescription.trim()}
                className="group relative px-8 py-4 bg-gray-900 text-white font-bold rounded-xl
                         hover:bg-primary-600 focus:outline-none focus:ring-4 
                         focus:ring-primary-500/30 focus:ring-offset-2
                         disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none
                         transition-all duration-300 shadow-lg hover:shadow-primary-500/30
                         flex items-center gap-3 text-lg overflow-hidden w-full md:w-auto justify-center"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing your fit...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Generate Analysis
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <AnalysisResults result={result as AnalysisResult} />
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-white text-gray-700 font-medium rounded-xl
                         border border-gray-200 shadow-sm hover:bg-gray-50 
                         focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2
                         transition-all duration-200 hover:shadow-md"
              >
                Mock another Interview
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
