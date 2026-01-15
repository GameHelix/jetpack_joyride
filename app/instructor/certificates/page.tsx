'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import { format } from 'date-fns'

interface Enrollment {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
  enrolledAt: string
  certificate: {
    id: string
    certificateNumber: string
    issuedAt: string
  } | null
}

interface Section {
  id: string
  term: string
  course: {
    code: string
    title: string
  }
  _count: {
    enrollments: number
  }
  enrollments: Enrollment[]
}

export default function InstructorCertificatesPage() {
  const { data: session, status } = useSession()
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSections()
    }
  }, [status])

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/instructor/sections?includeCertificates=true')
      const data = await response.json()

      if (data.success) {
        setSections(data.sections || [])
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleIssueCertificate = async (enrollmentId: string) => {
    if (!confirm('Issue a certificate for this student?')) {
      return
    }

    setIssuing(enrollmentId)
    try {
      const response = await fetch('/api/certificates/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enrollmentId }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Certificate issued successfully!')
        fetchSections() // Refresh the list
      } else {
        alert(data.error || 'Failed to issue certificate')
      }
    } catch (error) {
      console.error('Error issuing certificate:', error)
      alert('Failed to issue certificate')
    } finally {
      setIssuing(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout role="INSTRUCTOR">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout role={session.user.role}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#5C2482]">
            Issue Certificates
          </h1>
          <p className="mt-2 text-gray-600">
            Manage and issue certificates to students who have completed your courses
          </p>
        </div>

        {sections.length === 0 ? (
          <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500">
              You don't have any sections yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-xl shadow border border-gray-200"
              >
                {/* Section Header */}
                <div className="bg-gradient-to-r from-[#5C2482] to-[#7B3FA3] px-6 py-4 text-white rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">
                        {section.course.code} - {section.course.title}
                      </h3>
                      <p className="text-purple-100 text-xs sm:text-sm mt-1">
                        {section.term} • {section._count.enrollments} students
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enrolled Students */}
                <div className="overflow-x-auto">
                  {section.enrollments.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No enrolled students
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Enrolled
                          </th>
                          <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Certificate Status
                          </th>
                          <th className="px-4 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {section.enrollments.map((enrollment) => (
                          <tr key={enrollment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-xs sm:text-sm font-medium text-[#5C2482]">
                                  {enrollment.user.name}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500">
                                  {enrollment.user.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                              {format(new Date(enrollment.enrolledAt), 'MMM d, yyyy')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {enrollment.certificate ? (
                                <div>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Issued
                                  </span>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {format(new Date(enrollment.certificate.issuedAt), 'MMM d, yyyy')}
                                  </div>
                                </div>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Not Issued
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                              {enrollment.certificate ? (
                                <a
                                  href={`/verify/${enrollment.certificate.certificateNumber}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#5C2482] hover:underline"
                                >
                                  View Certificate
                                </a>
                              ) : (
                                <button
                                  onClick={() => handleIssueCertificate(enrollment.id)}
                                  disabled={issuing === enrollment.id}
                                  className="px-3 py-1.5 bg-[#F95B0E] text-white rounded-xl hover:bg-[#d94f0c] disabled:opacity-50 disabled:cursor-not-allowed transition text-xs font-medium"
                                >
                                  {issuing === enrollment.id ? 'Issuing...' : 'Issue Certificate'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
