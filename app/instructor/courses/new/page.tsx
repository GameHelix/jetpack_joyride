'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import { useSession } from 'next-auth/react'

export default function NewCoursePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    term: '',
    capacity: 30,
    visibility: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create course')
      }

      // Redirect to course detail page
      router.push(`/instructor/courses/${data.course.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user) {
    return null
  }

  return (
    <DashboardLayout role={session.user.role}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#5C2482]">
            Create New Course
          </h1>
          <p className="mt-2 text-gray-600">
            Set up a new course and create the first section
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Course Code */}
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Course Code *
              </label>
              <input
                type="text"
                id="code"
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., CS101"
                maxLength={20}
              />
              <p className="mt-1 text-sm text-gray-500">
                Unique identifier for the course
              </p>
            </div>

            {/* Course Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Course Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Introduction to Computer Science"
                maxLength={200}
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide a brief description of the course..."
              />
            </div>

            {/* Term */}
            <div>
              <label
                htmlFor="term"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Term/Semester *
              </label>
              <input
                type="text"
                id="term"
                required
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Spring 2026, Fall 2026"
                maxLength={50}
              />
            </div>

            {/* Section Capacity */}
            <div>
              <label
                htmlFor="capacity"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Section Capacity *
              </label>
              <input
                type="number"
                id="capacity"
                required
                min="1"
                max="500"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Maximum number of students for the first section
              </p>
            </div>

            {/* Visibility */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="visibility"
                checked={formData.visibility}
                onChange={(e) =>
                  setFormData({ ...formData, visibility: e.target.checked })
                }
                className="w-4 h-4 text-[#5C2482] border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="visibility"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Make course visible to students
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#F95B0E] text-white rounded-xl hover:bg-[#d94f0c] disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
