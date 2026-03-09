'use client'

import { useState } from 'react'

interface AIGradingAssistantProps {
  submissionId: string
  onGradeSuggestion?: (grade: number, feedback: string) => void
}

export default function AIGradingAssistant({
  submissionId,
  onGradeSuggestion,
}: AIGradingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<{
    suggestedGrade: number
    feedback: string
    strengths: string[]
    improvements: string[]
  } | null>(null)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    setAnalysis(null)

    try {
      const res = await fetch('/api/ai/grading-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          mode: 'full',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get AI analysis')
      }

      if (data.analysis?.mode === 'full') {
        setAnalysis({
          suggestedGrade: data.analysis.suggestedGrade,
          feedback: data.analysis.feedback,
          strengths: data.analysis.strengths,
          improvements: data.analysis.improvements,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleUseGrade = () => {
    if (analysis && onGradeSuggestion) {
      onGradeSuggestion(analysis.suggestedGrade, analysis.feedback)
      setIsOpen(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true)
          handleAnalyze()
        }}
        className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
      >
        <span className="mr-2">🤖</span>
        AI Grading Assistant
      </button>
    )
  }

  return (
    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 flex items-center">
          <span className="mr-2">🤖</span>
          AI Grading Analysis
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
        >
          ✕
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="ml-3 text-indigo-700 dark:text-indigo-300">Analyzing submission...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                Suggested Grade
              </p>
              <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {analysis.suggestedGrade}%
              </span>
            </div>
            <div className="border-t border-indigo-100 dark:border-indigo-800 pt-3">
              <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                Overall Feedback:
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {analysis.feedback}
              </p>
            </div>
          </div>

          {analysis.strengths.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                ✓ Strengths:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {analysis.strengths.map((strength, idx) => (
                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.improvements.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                ⚠ Areas for Improvement:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {analysis.improvements.map((improvement, idx) => (
                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition text-sm"
            >
              Ignore
            </button>
            {onGradeSuggestion && (
              <button
                onClick={handleUseGrade}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
              >
                Use This Grade & Feedback
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
