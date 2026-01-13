'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { format } from 'date-fns'

interface Enrollment {
  id: string
  enrolledAt: string
  user: {
    id: string
    name: string
    email: string
  }
  section: {
    id: string
    course: {
      code: string
      title: string
    }
    instructor: {
      name: string
      email: string
    }
  }
}

export default function ModeratorEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments/pending')
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data.enrollments)
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to approve this enrollment?')) return

    setProcessing(enrollmentId)
    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}/approve`, {
        method: 'POST',
      })

      if (response.ok) {
        setEnrollments(enrollments.filter(e => e.id !== enrollmentId))
        alert('Enrollment approved successfully')
      } else {
        const data = await response.json()
        alert(`Failed to approve: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to approve enrollment:', error)
      alert('Failed to approve enrollment')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (enrollmentId: string) => {
    const reason = prompt('Enter reason for rejection (optional):')
    if (reason === null) return // User cancelled

    setProcessing(enrollmentId)
    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        setEnrollments(enrollments.filter(e => e.id !== enrollmentId))
        alert('Enrollment rejected successfully')
      } else {
        const data = await response.json()
        alert(`Failed to reject: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to reject enrollment:', error)
      alert('Failed to reject enrollment')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <DashboardLayout role="MODERATOR">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#5C2482]">Pending Enrollments</h1>
          <p className="mt-2 text-gray-600">
            Review and manage enrollment requests
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-[#5C2482]">No pending enrollments</h3>
            <p className="mt-1 text-sm text-gray-500">All enrollment requests have been processed.</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-[#5C2482]">{enrollment.user.name}</div>
                        <div className="text-sm text-gray-500">{enrollment.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-[#5C2482]">{enrollment.section.course.code}</div>
                        <div className="text-sm text-gray-500">{enrollment.section.course.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#5C2482]">{enrollment.section.instructor.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(enrollment.enrolledAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleApprove(enrollment.id)}
                        disabled={processing === enrollment.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-[#F95B0E] hover:bg-[#d94f0c] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === enrollment.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(enrollment.id)}
                        disabled={processing === enrollment.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === enrollment.id ? 'Processing...' : 'Reject'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
