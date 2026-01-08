'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard-layout'

type Enrollment = {
  id: string
  status: string
  enrolledAt: string
  user: {
    id: string
    name: string
    email: string
  }
  section: {
    id: string
    capacity: number
    term: string
    course: {
      code: string
      title: string
      description: string | null
    }
    instructor: {
      name: string
    }
    _count: {
      enrollments: number
    }
  }
}

export default function ModeratorEnrollmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

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
      fetchEnrollments()
    }
  }, [session])

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/moderator/enrollments')
      const data = await response.json()

      if (data.success) {
        setEnrollments(data.enrollments)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch enrollments')
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollmentAction = async (enrollmentId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/moderator/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, action }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh enrollments
        fetchEnrollments()
      } else {
        alert(data.error || 'Failed to process enrollment')
      }
    } catch (err) {
      alert('Failed to process enrollment')
    }
  }

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesStatus = statusFilter === 'ALL' || enrollment.status === statusFilter
    const matchesSearch =
      !searchQuery ||
      enrollment.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.section.course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.section.course.title.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const stats = {
    total: enrollments.length,
    pending: enrollments.filter((e) => e.status === 'PENDING').length,
    enrolled: enrollments.filter((e) => e.status === 'ENROLLED').length,
    rejected: enrollments.filter((e) => e.status === 'REJECTED').length,
    waitlisted: enrollments.filter((e) => e.status === 'WAITLISTED').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENROLLED':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      case 'REJECTED':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      case 'WAITLISTED':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout role={session?.user?.role || 'MODERATOR'}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading enrollments...</p>
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
            Enrollment Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Review and manage student enrollment requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow p-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">Pending</p>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pending}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-4">
            <p className="text-sm text-green-700 dark:text-green-300">Enrolled</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.enrolled}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">Waitlisted</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.waitlisted}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-4">
            <p className="text-sm text-red-700 dark:text-red-300">Rejected</p>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ENROLLED">Enrolled</option>
                <option value="WAITLISTED">Waitlisted</option>
                <option value="REJECTED">Rejected</option>
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
                placeholder="Search students or courses..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Enrollments List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Enrollments ({filteredEnrollments.length})
            </h2>
          </div>
          <div className="p-6">
            {filteredEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No enrollments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEnrollments.map((enrollment) => {
                  const currentEnrollments = enrollment.section._count.enrollments
                  const capacity = enrollment.section.capacity
                  const isFull = currentEnrollments >= capacity

                  return (
                    <div
                      key={enrollment.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Student Info */}
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {enrollment.user.name}
                            </h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                enrollment.status
                              )}`}
                            >
                              {enrollment.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {enrollment.user.email}
                          </p>

                          {/* Course Info */}
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {enrollment.section.course.code}: {enrollment.section.course.title}
                            </p>
                            {enrollment.section.course.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {enrollment.section.course.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <span>Instructor: {enrollment.section.instructor.name}</span>
                              <span>•</span>
                              <span>Term: {enrollment.section.term}</span>
                              <span>•</span>
                              <span className={isFull ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                                Capacity: {currentEnrollments}/{capacity}
                                {isFull && ' (FULL)'}
                              </span>
                            </div>
                          </div>

                          {/* Enrollment Date */}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Requested: {new Date(enrollment.enrolledAt).toLocaleString()}
                          </p>
                        </div>

                        {/* Actions */}
                        {enrollment.status === 'PENDING' && (
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEnrollmentAction(enrollment.id, 'approve')}
                              disabled={isFull}
                              className={`px-4 py-2 rounded-lg transition ${
                                isFull
                                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {isFull ? 'Full' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleEnrollmentAction(enrollment.id, 'reject')}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
