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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  const steps = [
    { num: 1, label: 'Upload Resume' },
    { num: 2, label: 'Add Job Context' },
    { num: 3, label: 'Get Analysis' },
  ];

  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md glow-primary">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground font-heading">ResumeAI</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* ── Hero ───────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
              >
                <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                  Standard v2.1
                </Badge>

                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight font-heading">
                  Architect Your{' '}
                  <span className="text-primary bg-gradient-to-r from-primary-500 to-primary-400 bg-clip-text text-transparent">
                    Career Fit
                  </span>
                </h1>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Deploy advanced AI to map your professional document against market requirements.
                  Identify skill gaps with contextual precision.
                </p>
              </motion.div>

              {/* ── Stepper ────────────────────────────────────── */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-12">
                {steps.map((step, idx) => (
                  <div key={step.num} className="flex items-center gap-2 sm:gap-3">
                    {idx > 0 && (
                      <div className={`hidden sm:block w-8 h-[2px] rounded-full transition-colors duration-300 ${currentStep >= step.num ? 'bg-primary' : 'bg-border'
                        }`} />
                    )}
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                        border-2 transition-all duration-300
                        ${currentStep >= step.num
                          ? 'border-primary bg-primary text-primary-foreground shadow-md'
                          : 'border-border bg-background text-muted-foreground'
                        }`}
                      >
                        {step.num}
                      </div>
                      <span className={`text-sm font-medium hidden sm:inline transition-colors duration-200 ${currentStep >= step.num ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                        {step.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Input Cards ────────────────────────────────── */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Upload Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <Card className="hover-lift shadow-depth h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                          <FileText className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Upload Resume</CardTitle>
                          <CardDescription>PDF format, max 10MB</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Job Description Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <Card className="hover-lift shadow-depth h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Job Description</CardTitle>
                          <CardDescription>Paste requirements here</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <JobDescriptionInput
                        value={jobDescription}
                        onChange={setJobDescription}
                        disabled={isLoading}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* ── Error Message ──────────────────────────────── */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive mb-6"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── CTA Button ─────────────────────────────────── */}
              <div className="flex justify-center">
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading || !file || !jobDescription.trim() || jobDescription.trim().length < 50}
                  size="xl"
                  className="shadow-lg glow-primary"
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
                </Button>
              </div>

              {/* ── Provider Info ──────────────────────────────── */}
              {providerInfo && (
                <p className="text-center mt-6 text-xs text-muted-foreground">
                  Powered by {providerInfo.aiProvider}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <AnalysisResults result={result as AnalysisResult} />
              <div className="flex justify-center pt-4">
                <Button variant="outline" size="lg" onClick={handleReset} className="press-scale">
                  Analyze Another Resume
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
