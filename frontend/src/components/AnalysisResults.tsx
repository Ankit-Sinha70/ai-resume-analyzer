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
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (result.matchPercentage >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [result.matchPercentage]);

  const getScoreData = (percentage: number) => {
    if (percentage >= 80) return { label: 'Excellent Match', color: 'text-emerald-600 dark:text-emerald-500' };
    if (percentage >= 60) return { label: 'Good Match', color: 'text-amber-600 dark:text-amber-500' };
    return { label: 'Needs Improvement', color: 'text-red-600 dark:text-red-500' };
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
      addLine('\\nMatched Skills:', 12, true);
      result.matchedSkillDetails.forEach(skill => {
        addLine(`• ${skill.skill}: ${skill.rationale}`);
      });
    }

    if (result.missingSkillDetails && result.missingSkillDetails.length > 0) {
      y += 5;
      addLine('\\nSkills to Develop:', 12, true);
      result.missingSkillDetails.forEach(skill => {
        addLine(`• ${skill.skill}: ${skill.rationale}`);
      });
    }

    if (result.suggestions && result.suggestions.length > 0) {
      y += 5;
      addLine('\\nRecommendations:', 12, true);
      result.suggestions.forEach((suggestion, index) => {
        addLine(`${index + 1}. ${suggestion}`);
      });
    }

    doc.save('resume-analysis.pdf');
    toast.success('PDF report downloaded');
  };

  const scoreData = getScoreData(result.matchPercentage);

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Analysis Complete</h2>
            <p className="text-sm text-muted-foreground">Your resume has been analyzed against the job requirements</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={copySuggestions}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors focus-ring"
              title="Copy suggestions"
            >
              {copied ? <Check className="w-4 h-4 text-primary-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button
              onClick={downloadMarkdown}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors focus-ring"
              title="Download Markdown"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={downloadPdf}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors focus-ring text-sm font-medium"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Match Score */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - result.matchPercentage / 100)}`}
                className={scoreData.color}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{result.matchPercentage}%</span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className={`text-xl font-semibold ${scoreData.color} mb-2`}>{scoreData.label}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {result.matchPercentage >= 80 && "Outstanding! Your resume aligns exceptionally well with the job requirements."}
              {result.matchPercentage >= 60 && result.matchPercentage < 80 && "Strong fit! Your resume shows good alignment with most requirements."}
              {result.matchPercentage < 60 && "Consider developing the missing skills to improve your match score."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Skills Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Matched Skills */}
        {result.matchedSkillDetails && result.matchedSkillDetails.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Validated Skills</h3>
            </div>
            <div className="space-y-3">
              {result.matchedSkillDetails.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="font-medium text-sm text-foreground mb-1">{item.skill}</div>
                  <p className="text-xs text-muted-foreground">{item.rationale}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Missing Skills */}
        {result.missingSkillDetails && result.missingSkillDetails.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Areas to Develop</h3>
            </div>
            <div className="space-y-3">
              {result.missingSkillDetails.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="font-medium text-sm text-foreground mb-1">{item.skill}</div>
                  <p className="text-xs text-muted-foreground">{item.rationale}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Recommendations */}
      {result.suggestions && result.suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Strategic Recommendations</h3>
          </div>
          <ul className="space-y-3">
            {result.suggestions.map((suggestion, index) => (
              <li key={index} className="flex gap-3 text-sm">
                <span className="font-semibold text-primary-500 flex-shrink-0">{index + 1}.</span>
                <span className="text-foreground leading-relaxed">{suggestion}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

function buildMarkdown(result: AnalysisResult): string {
  let md = `# Resume Analysis Report\n\n`;
  md += `## Match Score: ${result.matchPercentage}%\n\n`;

  if (result.matchedSkillDetails && result.matchedSkillDetails.length > 0) {
    md += `## Validated Skills\n\n`;
    result.matchedSkillDetails.forEach(skill => {
      md += `- **${skill.skill}**: ${skill.rationale}\n`;
    });
    md += `\n`;
  }

  if (result.missingSkillDetails && result.missingSkillDetails.length > 0) {
    md += `## Skills to Develop\n\n`;
    result.missingSkillDetails.forEach(skill => {
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
