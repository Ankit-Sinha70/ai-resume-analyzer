'use client';

import { useEffect, useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { JobDescriptionInput } from '@/components/JobDescriptionInput';
import { analyzeResume, getProviderInfo, checkResumeQuality } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AnalysisResult, ProviderInfo } from '@/types';
import { FileText, Briefcase, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { AnalysisResults } from '@/components/AnalysisResults';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQualityChecking, setIsQualityChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    getProviderInfo().then((info: ProviderInfo | null) => {
      if (info) setProviderInfo(info);
    });
  }, []);

  useEffect(() => {
    if (file && !jobDescription.trim()) {
      setCurrentStep(2);
    } else if (file && jobDescription.trim().length >= 50) {
      setCurrentStep(3);
    } else if (file) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [file, jobDescription]);

  const handleAnalyze = async () => {
    const validation = validateInputs(file, jobDescription);
    if (validation) {
      setError(validation);
      return;
    }

    setIsLoading(true);
    setIsQualityChecking(true);
    setError(null);
    setResult(null);

    try {
      if (file) {
        const qualityResponse = await checkResumeQuality(file);
        setIsQualityChecking(false);

        if (qualityResponse.success && qualityResponse.data) {
          if (!qualityResponse.data.isSuitable) {
            setError(`Quality Check: ${qualityResponse.data.summary}`);
            setIsLoading(false);
            return;
          }
        }
      }

      const response = await analyzeResume(file as File, jobDescription);
      if (response.success && response.data) {
        setResult(response.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(response.error || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
      setIsQualityChecking(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription('');
    setResult(null);
    setError(null);
    setFileError('');
    setCurrentStep(1);
  };

  const validateInputs = (resume: File | null, description: string): string | null => {
    if (!resume) return 'Please upload your resume.';
    if (!description.trim()) return 'Job description is required for analysis.';
    if (description.trim().length < 50) return 'Job description must be at least 50 characters.';
    return null;
  };

  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      {/* Top Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">ResumeAI</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {!result ? (
          <>
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              {/* Version Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                Standard v2.1
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Architect Your{' '}
                <span className="text-primary-500">Career Fit</span>
              </h1>

              {/* Supporting Description */}
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Deploy advanced AI to map your professional document against market requirements.
                Identify skill gaps with contextual precision.
              </p>
            </motion.div>

            {/* Horizontal Stepper */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 1
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-border bg-background text-muted-foreground'
                  }`}>
                  1
                </div>
                <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                  Upload Resume
                </span>
              </div>

              <ArrowRight className="w-4 h-4 text-muted-foreground" />

              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 2
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-border bg-background text-muted-foreground'
                  }`}>
                  2
                </div>
                <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                  Add Job Context
                </span>
              </div>

              <ArrowRight className="w-4 h-4 text-muted-foreground" />

              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 3
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-border bg-background text-muted-foreground'
                  }`}>
                  3
                </div>
                <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                  Get Analysis
                </span>
              </div>
            </div>

            {/* Two-Card Layout */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Upload Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card card-hover cosmic-float p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Upload Resume</h2>
                    <p className="text-sm text-muted-foreground">PDF format, max 10MB</p>
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
              </motion.div>

              {/* Job Description Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card card-hover cosmic-float p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Job Description</h2>
                    <p className="text-sm text-muted-foreground">Paste requirements here</p>
                  </div>
                </div>
                <JobDescriptionInput
                  value={jobDescription}
                  onChange={setJobDescription}
                  disabled={isLoading}
                />
              </motion.div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 px-6 py-4 text-sm text-red-700 dark:text-red-400 mb-6"
              >
                {error}
              </motion.div>
            )}

            {/* CTA Button */}
            <div className="flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !file || !jobDescription.trim() || jobDescription.trim().length < 50}
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary-500 text-white font-semibold rounded-lg
                         hover:bg-primary-600 focus-ring btn-press
                         disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed
                         transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isQualityChecking ? 'Evaluating Quality...' : 'Analyzing...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Analysis
                  </>
                )}
              </button>
            </div>

            {/* Provider Info */}
            {providerInfo && (
              <p className="text-center mt-6 text-xs text-muted-foreground">
                Powered by {providerInfo.aiProvider}
              </p>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <AnalysisResults result={result as AnalysisResult} />
            <div className="flex justify-center pt-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-card text-foreground font-medium rounded-lg border border-border
                         hover:bg-muted transition-all duration-200 shadow-sm hover:shadow focus-ring"
              >
                Analyze Another Resume
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
