'use client'

import { useState } from 'react'

interface Question {
  questionText: string
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  options: string[]
  correctAnswer: string
  points: number
}

interface AIQuestionGeneratorProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (questions: Question[]) => void
}

export function AIQuestionGenerator({ isOpen, onClose, onGenerate }: AIQuestionGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    topic: '',
    count: 5,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    questionTypes: ['multiple_choice'] as string[],
    pointsPerQuestion: 1,
  })

  const toggleQuestionType = (type: string) => {
    if (formData.questionTypes.includes(type)) {
      if (formData.questionTypes.length > 1) {
        setFormData({
          ...formData,
          questionTypes: formData.questionTypes.filter(t => t !== type)
        })
      }
    } else {
      setFormData({
        ...formData,
        questionTypes: [...formData.questionTypes, type]
      })
    }
  }

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions')
      }

      onGenerate(data.questions)
      onClose()

      // Reset form
      setFormData({
        topic: '',
        count: 5,
        difficulty: 'medium',
        questionTypes: ['multiple_choice'],
        pointsPerQuestion: 1,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Question Generator</h2>
                <p className="text-sm text-gray-600">Generate exam questions automatically with AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-500 text-red-900 px-4 py-3 rounded-xl">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic / Subject *
            </label>
            <textarea
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Introduction to Machine Learning, Photosynthesis, World War II..."
              rows={3}
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Describe the topic or subject area for the questions
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions *
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">Max: 20 questions</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level *
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Question Types *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'multiple_choice', label: 'Multiple Choice', icon: '📝' },
                { value: 'true_false', label: 'True/False', icon: '✓✗' },
                { value: 'short_answer', label: 'Short Answer', icon: '💬' },
                { value: 'essay', label: 'Essay', icon: '📄' },
              ].map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition ${
                    formData.questionTypes.includes(type.value)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.questionTypes.includes(type.value)}
                    onChange={() => toggleQuestionType(type.value)}
                    className="w-4 h-4 text-purple-600"
                    disabled={loading}
                  />
                  <span className="text-xl">{type.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{type.label}</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Select one or more question types to generate
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points per Question *
            </label>
            <input
              type="number"
              min={0.5}
              max={100}
              step={0.5}
              value={formData.pointsPerQuestion}
              onChange={(e) => setFormData({ ...formData, pointsPerQuestion: parseFloat(e.target.value) || 1 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">AI Generation Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Be specific with your topic for better results</li>
                  <li>Generated questions will be added to your existing questions</li>
                  <li>You can review and edit all questions before creating the exam</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-white transition font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !formData.topic.trim()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Questions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
