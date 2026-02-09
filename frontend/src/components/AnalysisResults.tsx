'use client';

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { AnalysisResult } from '@/types';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Plus,
  Lightbulb,
  TrendingUp,
  Copy,
  Check,
  Download,
  FileText,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (result.matchPercentage >= 70) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: NodeJS.Timeout = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [result.matchPercentage]);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981'; // emerald-500
    if (percentage >= 60) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
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
        y += fontSize * 0.5 + 2;
      });
      y += 2;
    };

    addLine('AI Resume Analysis Report', 18, true);
    y += 5;
    addLine(`Match Score: ${result.matchPercentage}%`, 14, true);
    y += 10;

    addLine(`Matched Skills`, 12, true);
    const matched = result.matchedSkillDetails?.length
      ? result.matchedSkillDetails.map(m => `${m.skill}: ${m.rationale}`)
      : result.matchedSkills;
    matched.forEach(s => addLine(`• ${s}`));
    y += 5;

    addLine(`Missing Skills`, 12, true);
    const missing = result.missingSkillDetails?.length
      ? result.missingSkillDetails.map(m => `${m.skill}: ${m.rationale}`)
      : result.missingSkills;
    missing.forEach(s => addLine(`• ${s}`));
    y += 5;

    addLine(`Additional Skills`, 12, true);
    addLine(result.additionalSkills.join(', '));
    y += 5;

    addLine('Improvement Suggestions', 12, true);
    result.suggestions.forEach((s, i) => addLine(`${i + 1}. ${s}`));

    doc.save('resume-analysis.pdf');
    toast.success('PDF report downloaded');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const radius = 60;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (result.matchPercentage / 100) * circumference;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Top Row: Score & Stats */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Score Card */}
        <motion.div variants={itemVariants} className="md:col-span-5 lg:col-span-4 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-50" />

          <h2 className="text-xl font-bold text-gray-800 mb-6 relative z-10 font-heading">Match Score</h2>

          <div className="relative z-10 w-48 h-48 flex items-center justify-center">
            {/* Progress Ring */}
            <svg
              height={radius * 2 * 1.5}
              width={radius * 2 * 1.5}
              className="transform -rotate-90 w-full h-full"
            >
              <circle
                stroke="#e2e8f0"
                strokeWidth={stroke}
                fill="transparent"
                r={normalizedRadius}
                cx="50%"
                cy="50%"
              />
              <motion.circle
                stroke={getScoreColor(result.matchPercentage)}
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
                fill="transparent"
                r={normalizedRadius}
                cx="50%"
                cy="50%"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-5xl font-black text-gray-900 font-heading"
              >
                {result.matchPercentage}%
              </motion.span>
              <span className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Overall</span>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-6 relative z-10 text-pretty">
            {result.matchPercentage >= 80 ? 'Outstanding! Your profile is highly competitive.' :
              result.matchPercentage >= 60 ? 'Good start. Optimize a few areas to stand out.' :
                'Needs improvement. Focus on the missing skills below.'}
          </p>
        </motion.div>

        {/* Action & Stats Area */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6">
          {/* Actions */}
          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-white/50 p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-heading flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary-500" />
                Export & Share
              </h3>
              <p className="text-sm text-gray-500">Download your detailed report</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={copySuggestions}
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all hover:scale-105 active:scale-95"
                title="Copy Suggestions"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
              <button
                onClick={downloadMarkdown}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <FileText className="w-4 h-4" />
                Markdown
              </button>
              <button
                onClick={downloadPdf}
                className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gray-900/20"
              >
                <Download className="w-4 h-4" />
                PDF Report
              </button>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            <motion.div variants={itemVariants} className="bg-emerald-50/80 backdrop-blur-sm rounded-3xl border border-emerald-100 p-6 flex flex-col justify-center transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="font-bold text-emerald-900">Matched</span>
              </div>
              <span className="text-4xl font-black text-emerald-700 font-heading">
                {result.matchedSkillDetails?.length ?? result.matchedSkills.length}
              </span>
              <p className="text-sm text-emerald-600/80 font-medium">Keywords Found</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-rose-50/80 backdrop-blur-sm rounded-3xl border border-rose-100 p-6 flex flex-col justify-center transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-rose-100/50 rounded-lg text-rose-600">
                  <XCircle className="w-6 h-6" />
                </div>
                <span className="font-bold text-rose-900">Missing</span>
              </div>
              <span className="text-4xl font-black text-rose-700 font-heading">
                {result.missingSkillDetails?.length ?? result.missingSkills.length}
              </span>
              <p className="text-sm text-rose-600/80 font-medium">Keywords to Add</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Skills & Suggestions */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column: Skills Detail */}
        <div className="md:col-span-12 lg:col-span-7 space-y-6">
          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 font-heading">Analysis Detail</h3>
            </div>
            <div className="p-0">
              {(result.matchedSkillDetails?.length ?? 0) > 0 && (
                <div className="p-6 border-b border-gray-50">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Matched Skills
                  </h4>
                  <div className="space-y-3">
                    {(result.matchedSkillDetails || []).map((item, idx) => (
                      <div key={idx} className="group flex items-start gap-3 p-3 hover:bg-emerald-50/50 rounded-xl transition-colors">
                        < CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{item.skill}</div>
                          <p className="text-sm text-gray-500 leading-relaxed">{item.rationale}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(result.missingSkillDetails?.length ?? 0) > 0 && (
                <div className="p-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-rose-600 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    Missing Skills
                  </h4>
                  <div className="space-y-3">
                    {(result.missingSkillDetails || []).map((item, idx) => (
                      <div key={idx} className="group flex items-start gap-3 p-3 hover:bg-rose-50/50 rounded-xl transition-colors">
                        < XCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-rose-700 transition-colors">{item.skill}</div>
                          <p className="text-sm text-gray-500 leading-relaxed">{item.rationale}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Additional Skills Tags */}
          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-white/50 p-6">
            <h3 className="font-bold text-gray-900 font-heading mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" />
              Additional Detected Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.additionalSkills.length > 0 ? (
                result.additionalSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 italic">No additional skills detected.</span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Recommendations */}
        <div className="md:col-span-12 lg:col-span-5">
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-3xl shadow-xl text-white p-8 sticky top-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                <Lightbulb className="w-6 h-6 text-yellow-300" />
              </div>
              <h3 className="text-2xl font-bold font-heading">Smart Recommendations</h3>
            </div>

            <ul className="space-y-6">
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className="flex gap-4 group">
                  <span className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center font-bold text-indigo-200 border border-white/5 group-hover:bg-white/20 group-hover:text-white transition-all">
                    {index + 1}
                  </span>
                  <p className="text-indigo-100 leading-relaxed group-hover:text-white transition-colors">
                    {suggestion}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-sm text-indigo-300">
                * Based on AI analysis of typical job descriptions in this domain.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function buildMarkdown(result: AnalysisResult): string {
  const lines: string[] = [];
  lines.push(`# AI Resume Analysis`);
  lines.push(`Date: ${new Date().toLocaleDateString()}`);
  lines.push('');
  lines.push(`**Match Score:** ${result.matchPercentage}%`);
  lines.push('');
  lines.push(`## Matched Skills (${(result.matchedSkillDetails || []).length})`);
  if (result.matchedSkillDetails) {
    result.matchedSkillDetails.forEach(m => lines.push(`- **${m.skill}**: ${m.rationale}`));
  } else {
    result.matchedSkills.forEach(s => lines.push(`- ${s}`));
  }
  lines.push('');
  lines.push(`## Missing Skills (${(result.missingSkillDetails || []).length})`);
  if (result.missingSkillDetails) {
    result.missingSkillDetails.forEach(m => lines.push(`- **${m.skill}**: ${m.rationale}`));
  } else {
    result.missingSkills.forEach(s => lines.push(`- ${s}`));
  }
  lines.push('');
  lines.push(`## Suggestions`);
  result.suggestions.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  return lines.join('\n');
}
