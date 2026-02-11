'use client';

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { AnalysisResult } from '@/types';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  Copy,
  Check,
  Download,
  FileText,
  TrendingUp,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const springEase = [0.16, 1, 0.3, 1] as const;
const bounceEase = [0.34, 1.56, 0.64, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: springEase },
  },
};

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const [copied, setCopied] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (result.matchPercentage >= 70) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#7C6DF6', '#C084FC', '#818CF8', '#A78BFA'],
      });
    }
  }, [result.matchPercentage]);

  useEffect(() => {
    const target = result.matchPercentage;
    const duration = 1400;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [result.matchPercentage]);

  const getScoreData = (percentage: number) => {
    if (percentage >= 80) return { label: 'Excellent Match', variant: 'success' as const, color: 'text-emerald-500 dark:text-emerald-400', ring: 'text-emerald-500' };
    if (percentage >= 60) return { label: 'Good Match', variant: 'warning' as const, color: 'text-amber-500 dark:text-amber-400', ring: 'text-amber-500' };
    return { label: 'Needs Improvement', variant: 'destructive' as const, color: 'text-red-500 dark:text-red-400', ring: 'text-red-500' };
  };

  const copySuggestions = async () => {
    const text = result.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Suggestions copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const md = buildMarkdown(result);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resume-analysis.md';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Markdown report downloaded');
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    let y = 20;

    const addLine = (text: string, fontSize = 10, isBold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, 170);
      lines.forEach((line: string) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 7;
      });
    };

    addLine('Resume Analysis Report', 18, true);
    y += 5;
    addLine(`Match Score: ${result.matchPercentage}%`, 14, true);
    y += 5;

    if (result.matchedSkillDetails && result.matchedSkillDetails.length > 0) {
      addLine('Matched Skills:', 12, true);
      result.matchedSkillDetails.forEach((skill) => {
        addLine(`• ${skill.skill}: ${skill.rationale}`);
      });
    }

    if (result.missingSkillDetails && result.missingSkillDetails.length > 0) {
      y += 5;
      addLine('Skills to Develop:', 12, true);
      result.missingSkillDetails.forEach((skill) => {
        addLine(`• ${skill.skill}: ${skill.rationale}`);
      });
    }

    if (result.suggestions && result.suggestions.length > 0) {
      y += 5;
      addLine('Recommendations:', 12, true);
      result.suggestions.forEach((suggestion, index) => {
        addLine(`${index + 1}. ${suggestion}`);
      });
    }

    doc.save('resume-analysis.pdf');
    toast.success('PDF report downloaded');
  };

  const scoreData = getScoreData(result.matchPercentage);
  const strokeDasharray = 2 * Math.PI * 56;
  const strokeDashoffset = strokeDasharray * (1 - animatedScore / 100);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Score Card ─────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-depth gradient-border card-glow overflow-hidden">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: bounceEase }}
                  className="icon-container"
                >
                  <Award className="w-5 h-5 text-accent-foreground" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl font-bold font-heading">Analysis Complete</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your resume has been analyzed against the job requirements
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" size="icon" onClick={copySuggestions}>
                        {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Copy suggestions</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" size="icon" onClick={downloadMarkdown}>
                        <FileText className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Download Markdown</TooltipContent>
                </Tooltip>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button onClick={downloadPdf} size="sm" className="gradient-primary border-0 group">
                    <Download className="w-4 h-4 group-hover:animate-wiggle" />
                    Export PDF
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Score Ring */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6, ease: bounceEase }}
                className="relative flex-shrink-0"
              >
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72" cy="72" r="56"
                    stroke="currentColor" strokeWidth="10"
                    fill="none" className="text-muted/50"
                  />
                  <circle
                    cx="72" cy="72" r="56"
                    stroke="currentColor" strokeWidth="10"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className={scoreData.ring}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      filter: 'drop-shadow(0 0 6px currentColor)',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-foreground font-heading">{animatedScore}%</span>
                </div>
              </motion.div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-3 mb-3 justify-center sm:justify-start">
                  <TrendingUp className={`w-5 h-5 ${scoreData.color}`} />
                  <h3 className={`text-xl font-semibold ${scoreData.color}`}>{scoreData.label}</h3>
                  <Badge variant={scoreData.variant}>{result.matchPercentage}%</Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {result.matchPercentage >= 80 && 'Outstanding! Your resume aligns exceptionally well with the job requirements.'}
                  {result.matchPercentage >= 60 && result.matchPercentage < 80 && 'Strong fit! Your resume shows good alignment with most requirements.'}
                  {result.matchPercentage < 60 && 'Consider developing the missing skills to improve your match score.'}
                </p>
                <Progress value={result.matchPercentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Gradient Divider ───────────────────────────── */}
      <div className="divider-gradient" />

      {/* ── Skills & Recommendations Tabs ──────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-depth gradient-border card-glow">
          <CardContent className="pt-6">
            <Tabs defaultValue="matched" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="matched" className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Validated</span>
                  {result.matchedSkillDetails?.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                      {result.matchedSkillDetails.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="missing" className="gap-2">
                  <XCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">To Develop</span>
                  {result.missingSkillDetails?.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                      {result.missingSkillDetails.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="gap-2">
                  <Lightbulb className="w-4 h-4" />
                  <span className="hidden sm:inline">Advice</span>
                  {result.suggestions?.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                      {result.suggestions.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Matched Skills */}
              <TabsContent value="matched">
                {result.matchedSkillDetails && result.matchedSkillDetails.length > 0 ? (
                  <div className="space-y-3 stagger-children">
                    {result.matchedSkillDetails.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-default group"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                          <div>
                            <div className="font-medium text-sm text-foreground">{item.skill}</div>
                            <p className="text-xs text-muted-foreground mt-1">{item.rationale}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No matched skills found.</p>
                )}
              </TabsContent>

              {/* Missing Skills */}
              <TabsContent value="missing">
                {result.missingSkillDetails && result.missingSkillDetails.length > 0 ? (
                  <div className="space-y-3 stagger-children">
                    {result.missingSkillDetails.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-default group"
                      >
                        <div className="flex items-start gap-3">
                          <XCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                          <div>
                            <div className="font-medium text-sm text-foreground">{item.skill}</div>
                            <p className="text-xs text-muted-foreground mt-1">{item.rationale}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No missing skills identified.</p>
                )}
              </TabsContent>

              {/* Suggestions */}
              <TabsContent value="suggestions">
                {result.suggestions && result.suggestions.length > 0 ? (
                  <div className="space-y-3 stagger-children">
                    {result.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-accent/30 border border-border transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:bg-accent/50 cursor-default group"
                      >
                        <div className="flex gap-3">
                          <span className="text-sm font-bold text-primary flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                            {index + 1}
                          </span>
                          <span className="text-sm text-foreground leading-relaxed">{suggestion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No suggestions available.</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function buildMarkdown(result: AnalysisResult): string {
  let md = `# Resume Analysis Report\n\n`;
  md += `## Match Score: ${result.matchPercentage}%\n\n`;

  if (result.matchedSkillDetails && result.matchedSkillDetails.length > 0) {
    md += `## Validated Skills\n\n`;
    result.matchedSkillDetails.forEach((skill) => {
      md += `- **${skill.skill}**: ${skill.rationale}\n`;
    });
    md += `\n`;
  }

  if (result.missingSkillDetails && result.missingSkillDetails.length > 0) {
    md += `## Skills to Develop\n\n`;
    result.missingSkillDetails.forEach((skill) => {
      md += `- **${skill.skill}**: ${skill.rationale}\n`;
    });
    md += `\n`;
  }

  if (result.suggestions && result.suggestions.length > 0) {
    md += `## Strategic Recommendations\n\n`;
    result.suggestions.forEach((suggestion, index) => {
      md += `${index + 1}. ${suggestion}\n`;
    });
  }

  return md;
}
