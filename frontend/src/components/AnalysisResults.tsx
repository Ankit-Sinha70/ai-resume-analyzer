'use client';

import { AnalysisResult } from '@/types';
import {
  CheckCircle,
  XCircle,
  Plus,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const getMatchColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getMatchBgColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-100';
    if (percentage >= 50) return 'bg-amber-100';
    return 'bg-red-100';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Match Percentage */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Match Score
          </h2>
          <span
            className={`text-3xl font-bold ${getMatchColor(result.matchPercentage)}`}
          >
            {result.matchPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(result.matchPercentage)}`}
            style={{ width: `${result.matchPercentage}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {result.matchPercentage >= 70
            ? '🎉 Great match! Your resume aligns well with this job.'
            : result.matchPercentage >= 50
              ? '👍 Good match with room for improvement.'
              : '💪 Consider adding more relevant skills to improve your match.'}
        </p>
      </div>

      {/* Skills Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Matched Skills */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Matched Skills
            <span className="ml-auto bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
              {result.matchedSkills.length}
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.matchedSkills.length > 0 ? (
              result.matchedSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No matched skills found</p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <XCircle className="w-5 h-5 text-red-500" />
            Missing Skills
            <span className="ml-auto bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
              {result.missingSkills.length}
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.missingSkills.length > 0 ? (
              result.missingSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full border border-red-200"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No missing skills - great job!
              </p>
            )}
          </div>
        </div>

        {/* Additional Skills */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <Plus className="w-5 h-5 text-blue-500" />
            Additional Skills
            <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
              {result.additionalSkills.length}
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.additionalSkills.length > 0 ? (
              result.additionalSkills.slice(0, 10).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No additional skills</p>
            )}
            {result.additionalSkills.length > 10 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                +{result.additionalSkills.length - 10} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          AI Suggestions
        </h3>
        <ul className="space-y-3">
          {result.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <p className="text-gray-700">{suggestion}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
