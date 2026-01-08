'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'

type Course = {
  id: string
  code: string
  title: string
  description: string | null
  term: string
  visibility: boolean
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
  _count: {
    sections: number
    enrollments: number
  }
}

export default function ModeratorCoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('ALL')

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }
    if (session.user.role !== 'MODERATOR' && session.user.role !== 'ADMIN') {
      router.push('/unauthorized')
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.role === 'MODERATOR' || session?.user?.role === 'ADMIN') {
      fetchCourses()
    }
  }, [session])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/moderator/courses')
      const data = await response.json()

      if (data.success) {
        setCourses(data.courses)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const toggleVisibility = async (courseId: string, currentVisibility: boolean) => {
    try {
      const response = await fetch('/api/moderator/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          action: 'toggle_visibility',
          visibility: !currentVisibility
        }),
      })

      const data = await response.json()

      if (data.success) {
        fetchCourses()
      } else {
        alert(data.error || 'Failed to update course visibility')
      }
    } catch (err) {
      alert('Failed to update course visibility')
    }
  }

  const filteredCourses = courses.filter((course) => {
    const matchesVisibility =
      visibilityFilter === 'ALL' ||
      (visibilityFilter === 'VISIBLE' && course.visibility) ||
      (visibilityFilter === 'HIDDEN' && !course.visibility)

    const matchesSearch =
      !searchQuery ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesVisibility && matchesSearch
  })

  const stats = {
    total: courses.length,
    visible: courses.filter((c) => c.visibility).length,
    hidden: courses.filter((c) => !c.visibility).length,
    totalSections: courses.reduce((sum, c) => sum + c._count.sections, 0),
    totalEnrollments: courses.reduce((sum, c) => sum + c._count.enrollments, 0),
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout role={session?.user?.role || 'MODERATOR'}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading courses...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role={session?.user?.role || 'MODERATOR'}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Course Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor and manage course visibility and content
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-4">
            <p className="text-sm text-green-700 dark:text-green-300">Visible</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.visible}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-4">
            <p className="text-sm text-red-700 dark:text-red-300">Hidden</p>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.hidden}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">Sections</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalSections}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow p-4">
            <p className="text-sm text-purple-700 dark:text-purple-300">Enrollments</p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalEnrollments}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Visibility
              </label>
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">All Courses</option>
                <option value="VISIBLE">Visible Only</option>
                <option value="HIDDEN">Hidden Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Courses ({filteredCourses.length})
            </h2>
          </div>
          <div className="p-6">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No courses found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Course Header */}
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {course.code}: {course.title}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              course.visibility
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}
                          >
                            {course.visibility ? 'VISIBLE' : 'HIDDEN'}
                          </span>
                        </div>

                        {/* Description */}
                        {course.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {course.description}
                          </p>
                        )}

                        {/* Course Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Term</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {course.term}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Sections</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {course._count.sections}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Enrollments</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {course._count.enrollments}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(course.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Created By */}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Created by: {course.createdBy.name} ({course.createdBy.email})
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => toggleVisibility(course.id, course.visibility)}
                          className={`px-4 py-2 rounded-lg transition ${
                            course.visibility
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {course.visibility ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
