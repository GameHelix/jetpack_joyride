'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard-layout'

interface Question {
  questionText: string
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  options: string[]
  correctAnswer: string
  points: number
}

export default function NewExamPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [sectionsLoading, setSectionsLoading] = useState(true)
  const [error, setError] = useState('')
  const [sections, setSections] = useState<any[]>([])

  const [formData, setFormData] = useState({
    sectionId: '',
    title: '',
    durationMinutes: 60,
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    isGroupExam: false,
  })

  const [questions, setQuestions] = useState<Question[]>([{
    questionText: '',
    questionType: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
  }])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    } else if (status === 'authenticated') {
      loadSections()
    }
  }, [status])

  async function loadSections() {
    try {
      const response = await fetch('/api/sections')
      if (!response.ok) throw new Error('Failed to load sections')
      const data = await response.json()
      setSections(data.sections || [])
    } catch (err) {
      setError('Failed to load sections')
    } finally {
      setSectionsLoading(false)
    }
  }

  function addQuestion() {
    setQuestions([
      ...questions,
      {
        questionText: '',
        questionType: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1,
      },
    ])
  }

  function removeQuestion(index: number) {
    if (questions.length === 1) return
    setQuestions(questions.filter((_, i) => i !== index))
  }

  function updateQuestion(index: number, updates: Partial<Question>) {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], ...updates }
    setQuestions(newQuestions)
  }

  function addOption(questionIndex: number) {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options.push('')
    setQuestions(newQuestions)
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    const newQuestions = [...questions]
    if (newQuestions[questionIndex].options.length <= 2) return
    newQuestions[questionIndex].options.splice(optionIndex, 1)
    setQuestions(newQuestions)
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        if (!q.questionText.trim()) {
          throw new Error(`Question ${i + 1}: Please enter question text`)
        }
        if (q.questionType === 'multiple_choice') {
          if (q.options.filter(o => o.trim()).length < 2) {
            throw new Error(`Question ${i + 1}: Please provide at least 2 options`)
          }
          if (!q.correctAnswer.trim()) {
            throw new Error(`Question ${i + 1}: Please select the correct answer`)
          }
        }
        if (q.questionType === 'true_false' && !q.correctAnswer) {
          throw new Error(`Question ${i + 1}: Please select the correct answer`)
        }
      }

      // Combine date and time
      const startDateTime = `${formData.startDate}T${formData.startTime}:00.000Z`
      const endDateTime = `${formData.endDate}T${formData.endTime}:00.000Z`

      const payload = {
        sectionId: formData.sectionId,
        title: formData.title,
        durationMinutes: formData.durationMinutes,
        startTime: startDateTime,
        endTime: endDateTime,
        isGroupExam: formData.isGroupExam,
        questions: questions.map((q, index) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.questionType === 'multiple_choice' ? q.options.filter(o => o.trim()) : undefined,
          correctAnswer: (q.questionType === 'multiple_choice' || q.questionType === 'true_false') ? q.correctAnswer : undefined,
          points: q.points,
          order: index,
        })),
      }

      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create exam')
      }

      router.push('/instructor/exams')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || sectionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <DashboardLayout role="INSTRUCTOR">
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 -m-8 p-4 md:p-8 min-h-screen">
        <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Create New Exam</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">Set up a timed exam for your students</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Basic Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Section *
                </label>
                <select
                  required
                  value={formData.sectionId}
                  onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                  className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.course.code}: {section.course.title} - {section.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Midterm Exam"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={480}
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Maximum: 480 minutes (8 hours)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={formData.startDate || today}
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isGroupExam}
                    onChange={(e) => setFormData({ ...formData, isGroupExam: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">
                    This is a group exam (requires individual scoring after submission)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                + Add Question
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Question {qIndex + 1}</h3>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-800 text-xs sm:text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={question.questionText}
                        onChange={(e) => updateQuestion(qIndex, { questionText: e.target.value })}
                        className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your question..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Question Type *
                        </label>
                        <select
                          value={question.questionType}
                          onChange={(e) => updateQuestion(qIndex, {
                            questionType: e.target.value as any,
                            options: e.target.value === 'multiple_choice' ? ['', '', '', ''] : [],
                            correctAnswer: '',
                          })}
                          className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="true_false">True/False</option>
                          <option value="short_answer">Short Answer</option>
                          <option value="essay">Essay</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Points *
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          step={0.5}
                          value={question.points}
                          onChange={(e) => updateQuestion(qIndex, { points: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {question.questionType === 'multiple_choice' && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700">
                            Options *
                          </label>
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                          >
                            + Add Option
                          </button>
                        </div>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={question.correctAnswer === option}
                                onChange={() => updateQuestion(qIndex, { correctAnswer: option })}
                                className="w-4 h-4 text-green-600"
                              />
                              <input
                                type="text"
                                required
                                value={option}
                                onChange={(e) => {
                                  const newValue = e.target.value
                                  updateOption(qIndex, oIndex, newValue)
                                  if (question.correctAnswer === option) {
                                    updateQuestion(qIndex, { correctAnswer: newValue })
                                  }
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`Option ${oIndex + 1}`}
                              />
                              {question.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  className="text-red-600 hover:text-red-800 text-xs sm:text-sm px-2"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Click the radio button to mark the correct answer
                        </p>
                      </div>
                    )}

                    {question.questionType === 'true_false' && (
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Correct Answer *
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              value="True"
                              checked={question.correctAnswer === 'True'}
                              onChange={(e) => updateQuestion(qIndex, { correctAnswer: e.target.value })}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-gray-900">True</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              value="False"
                              checked={question.correctAnswer === 'False'}
                              onChange={(e) => updateQuestion(qIndex, { correctAnswer: e.target.value })}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-gray-900">False</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {(question.questionType === 'short_answer' || question.questionType === 'essay') && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-xs sm:text-sm text-yellow-800">
                          This question requires manual grading. You'll grade it after students submit their answers.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>Total Points:</strong> {questions.reduce((sum, q) => sum + q.points, 0)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/instructor/exams')}
              className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {loading ? 'Creating...' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </DashboardLayout>
  )
}
