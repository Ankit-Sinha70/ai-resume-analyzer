'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { AnalysisResult } from '@/types';
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
} from 'lucide-react';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const [copied, setCopied] = useState(false);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-500';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const copySuggestions = async () => {
    const text = result.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
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
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 justify-center md:justify-start">
                <TrendingUp className="w-6 h-6 text-primary-600" />
                Analysis Report
              </h2>
              <p className="text-gray-500 max-w-md">
                {result.matchPercentage >= 80
                  ? 'Excellent alignmnent! Your resume strongly matches the job requirements.'
                  : result.matchPercentage >= 60
                  ? 'Good foundation. Focus on the missing skills to improve your ranking.'
                  : 'Low match. Consider adding more keywords or gaining specific skills mentioned.'}
              </p>
            </div>
            
            <div className="flex flex-col items-center justify-center min-w-[140px]">
              <div className="relative">
                <span className={`text-5xl font-black ${getScoreColor(result.matchPercentage)}`}>
                  {result.matchPercentage}%
                </span>
              </div>
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider mt-1">Match Score</span>
            </div>
          </div>

          <div className="mt-8 w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(result.matchPercentage)}`}
              style={{ width: `${result.matchPercentage}%` }}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start pt-6 border-t border-gray-50">
            <button
              onClick={copySuggestions}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Requests'}
            </button>
            <button
              onClick={downloadMarkdown}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Markdown
            </button>
            <button
              onClick={downloadPdf}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Matched Skills Column */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-50 bg-green-50/30 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Your Strengths
            </h3>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {result.matchedSkillDetails?.length ?? result.matchedSkills.length} Found
            </span>
          </div>
          <div className="p-0 flex-1">
            {(result.matchedSkillDetails?.length ?? 0) > 0 ? (
              <ul className="divide-y divide-gray-50">
                {(result.matchedSkillDetails || []).map((item, idx) => (
                  <li key={idx} className="p-4 hover:bg-green-50/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.skill}</p>
                        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{item.rationale}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No direct skill matches found yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Missing Skills Column */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-50 bg-red-50/30 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Missing Keywords
            </h3>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {result.missingSkillDetails?.length ?? result.missingSkills.length} Missing
            </span>
          </div>
          <div className="p-0 flex-1">
            {(result.missingSkillDetails?.length ?? 0) > 0 ? (
              <ul className="divide-y divide-gray-50">
                {(result.missingSkillDetails || []).map((item, idx) => (
                  <li key={idx} className="p-4 hover:bg-red-50/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.skill}</p>
                        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{item.rationale}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No missing skills detected. Great job!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Skills & Suggestions Grid */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Additional Skills (Span 8) */}
        <div className="md:col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-blue-500" />
            Additional Skills Detected
            <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
              {result.additionalSkills.length} Total
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.additionalSkills.length > 0 ? (
              result.additionalSkills.slice(0, 20).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm rounded-lg border border-gray-200 transition-colors"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No additional skills found.</p>
            )}
            {result.additionalSkills.length > 20 && (
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100">
                +{result.additionalSkills.length - 20} more
              </span>
            )}
          </div>
        </div>

        {/* Actionable Suggestions (Span 4) */}
        <div className="md:col-span-12 lg:col-span-4 bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-sm border border-indigo-100 p-6">
          <h3 className="font-semibold text-indigo-900 flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
            Key Recommendations
          </h3>
          <ul className="space-y-4">
            {result.suggestions.map((suggestion, index) => (
              <li key={index} className="flex gap-3 text-sm text-indigo-800">
                <span className="flex-shrink-0 w-6 h-6 bg-white shadow-sm text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold border border-indigo-100">
                  {index + 1}
                </span>
                <span className="leading-snug">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
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
