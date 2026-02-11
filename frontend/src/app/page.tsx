'use client';

import { useEffect, useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { JobDescriptionInput } from '@/components/JobDescriptionInput';
import { analyzeResume, getProviderInfo, checkResumeQuality } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AnalysisResult, ProviderInfo } from '@/types';
import { FileText, Briefcase, Sparkles, Loader2, ArrowRight, Zap, Shield, Target } from 'lucide-react';
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
    { num: 1, label: 'Upload Resume', icon: FileText },
    { num: 2, label: 'Add Job Context', icon: Briefcase },
    { num: 3, label: 'Get Analysis', icon: Sparkles },
  ];

  const features = [
    { icon: Zap, label: 'AI-Powered', desc: 'Advanced analysis engine' },
    { icon: Shield, label: 'Privacy First', desc: 'Your data stays secure' },
    { icon: Target, label: 'Precise Match', desc: 'Skill-level accuracy' },
  ];

  // Animation variants
  const springEase = [0.16, 1, 0.3, 1] as const;
  const bounceEase = [0.34, 1.56, 0.64, 1] as const;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: springEase },
    },
  };

  return (
    <main className="min-h-screen bg-background transition-colors duration-500">
      {/* ── Navigation ───────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="sticky top-0 z-40 glass"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-md animate-pulse-glow">
              <Sparkles className="w-5 h-5 text-primary-foreground group-hover:animate-wiggle transition-transform" />
            </div>
            <span className="text-lg font-bold text-foreground font-heading tracking-tight">
              Resume<span className="gradient-text">AI</span>
            </span>
          </div>
          <ThemeToggle />
        </div>
      </motion.nav>

      <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="input"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.25 } } as any}
            >
              {/* ── Hero ───────────────────────────────────────── */}
              <motion.div variants={itemVariants} className="text-center mb-14">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: bounceEase }}
                >
                  <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse" />
                    Standard v2.1
                  </Badge>
                </motion.div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight font-heading tracking-tight">
                  Architect Your{' '}
                  <span className="gradient-text">Career Fit</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Deploy advanced AI to map your professional document against market requirements.
                  Identify skill gaps with contextual precision.
                </p>

                {/* Feature pills */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-wrap items-center justify-center gap-3 mt-8"
                >
                  {features.map((feat, idx) => (
                    <motion.div
                      key={feat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + idx * 0.1, duration: 0.4, ease: bounceEase }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent/50 transition-all duration-300 cursor-default group"
                    >
                      <feat.icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-medium">{feat.label}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* ── Stepper ────────────────────────────────────── */}
              <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 sm:gap-4 mb-12">
                {steps.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep >= step.num;
                  return (
                    <div key={step.num} className="flex items-center gap-2 sm:gap-3">
                      {idx > 0 && (
                        <div className={`hidden sm:block w-8 h-[2px] rounded-full transition-all duration-500 ${isActive ? 'bg-primary shadow-[0_0_8px_rgba(124,109,246,0.3)]' : 'bg-border'
                          }`} />
                      )}
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{
                            scale: isActive ? 1 : 0.95,
                            borderColor: isActive ? 'hsl(252, 85%, 60%)' : 'hsl(220, 20%, 88%)',
                          }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                            border-2 transition-all duration-400
                            ${isActive
                              ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                              : 'border-border bg-background text-muted-foreground'
                            }`}
                        >
                          <StepIcon className="w-4 h-4" />
                        </motion.div>
                        <span className={`text-sm font-medium hidden sm:inline transition-colors duration-300 ${isActive ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                          {step.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              {/* ── Input Cards ────────────────────────────────── */}
              <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Upload Card */}
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.25 } }}
                  className="group"
                >
                  <Card className="shadow-depth gradient-border card-glow h-full transition-all duration-300 group-hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="icon-container group-hover:shadow-glow">
                          <FileText className="w-5 h-5 text-accent-foreground hover-glow-icon" />
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
                  whileHover={{ y: -4, transition: { duration: 0.25 } }}
                  className="group"
                >
                  <Card className="shadow-depth gradient-border card-glow h-full transition-all duration-300 group-hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="icon-container group-hover:shadow-glow">
                          <Briefcase className="w-5 h-5 text-accent-foreground hover-glow-icon" />
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
              </motion.div>

              {/* ── Error Message ──────────────────────────────── */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.25, ease: springEase }}
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive mb-6"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

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

              {/* ── Provider Info ──────────────────────────────── */}
              {providerInfo && (
                <motion.p
                  variants={itemVariants}
                  className="text-center mt-8 text-xs text-muted-foreground"
                >
                  Powered by {providerInfo.aiProvider}
                </motion.p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: springEase }}
              className="space-y-8"
            >
              <AnalysisResults result={result as AnalysisResult} />
              <motion.div
                initial={{ opacity: 0, y: 12 }}
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
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="outline" size="lg" onClick={handleReset} className="group">
                    <ArrowRight className="w-4 h-4 rotate-180 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                    Analyze Another Resume
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
