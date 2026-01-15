'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import { LeaveCourseButton } from '@/components/leave-course-button'

interface Course {
  id: string
  code: string
  title: string
  description: string | null
  sections: Section[]
}

interface Section {
  id: string
  term: string
  capacity: number
  instructor: {
    name: string
  }
  _count: {
    enrollments: number
  }
}

interface Enrollment {
  id: string
  section: {
    id: string
    term: string
    capacity: number
    instructor: {
      name: string
      email: string
    }
    course: {
      id: string
      code: string
      title: string
      description: string | null
    }
    _count: {
      enrollments: number
    }
  }
}

export default function StudentCoursesPage() {
  const { data: session, status } = useSession()
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [pendingSections, setPendingSections] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCourses()
    }
  }, [status])

  const fetchCourses = async () => {
    try {
      const [enrolledRes, availableRes, pendingRes] = await Promise.all([
        fetch('/api/student/enrollments'),
        fetch('/api/student/courses/available'),
        fetch('/api/enrollments/my-requests'),
      ])

      const enrolledData = await enrolledRes.json()
      const availableData = await availableRes.json()
      const pendingData = await pendingRes.json()

      if (enrolledData.success) {
        setEnrolledCourses(enrolledData.enrollments || [])
      }

      if (availableData.success) {
        setAvailableCourses(availableData.courses || [])
      }

      // Track pending section IDs
      if (pendingData.success && pendingData.enrollments) {
        const pending = new Set<string>(
          pendingData.enrollments
            .filter((e: any) => e.status === 'PENDING')
            .map((e: any) => e.sectionId as string)
        )
        setPendingSections(pending)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (sectionId: string) => {
    setEnrolling(sectionId)
    try {
      const response = await fetch('/api/enrollments/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sectionId }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Enrollment request submitted successfully! Waiting for instructor approval.')
        fetchCourses() // Refresh the course list
      } else {
        alert(data.error || 'Failed to submit enrollment request')
      }
    } catch (error) {
      console.error('Enrollment error:', error)
      alert('Failed to submit enrollment request')
    } finally {
      setEnrolling(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout role="STUDENT">
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
        {/* Enrolled Courses */}
        <div>
          <h1 className="text-3xl font-bold text-[#5C2482] mb-6">
            My Courses
          </h1>

          {enrolledCourses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-600 text-lg mb-2 font-medium">No courses yet</p>
              <p className="text-gray-500 text-sm">
                Browse available courses below to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {enrolledCourses.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#5C2482]/20 transition-all duration-200"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-block px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-[#5C2482]/10 to-[#7B3FA3]/10 text-[#5C2482] rounded-full border border-[#5C2482]/20">
                        {enrollment.section.course.code}
                      </span>
                      <div className="flex flex-col items-end gap-2">
                        <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Enrolled
                        </span>
                        <LeaveCourseButton
                          enrollmentId={enrollment.id}
                          courseCode={enrollment.section.course.code}
                          courseTitle={enrollment.section.course.title}
                        />
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {enrollment.section.course.title}
                    </h3>
                    {enrollment.section.course.description && (
                      <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">
                        {enrollment.section.course.description}
                      </p>
                    )}
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">{enrollment.section.instructor.name}</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {enrollment.section.term}
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {enrollment.section._count.enrollments}/{enrollment.section.capacity} students
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Courses */}
        {availableCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-[#5C2482] mb-6">
              Available Courses
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {availableCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-200"
                >
                  <div className="p-5 sm:p-6">
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-700 rounded-full border border-blue-200">
                        {course.code}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                    <div className="space-y-2 text-xs sm:text-sm pt-4 border-t border-gray-100">
                      {course.sections.map((section) => (
                        <div
                          key={section.id}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200/50"
                        >
                          <div className="flex-1 min-w-0 mr-3">
                            <p className="text-gray-900 font-medium truncate">
                              {section.instructor.name}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                              <span>{section.term}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {section._count.enrollments}/{section.capacity}
                              </span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleEnroll(section.id)}
                            disabled={
                              section._count.enrollments >= section.capacity ||
                              enrolling === section.id ||
                              pendingSections.has(section.id)
                            }
                            className={`px-3 py-1.5 text-white rounded-lg transition text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                              pendingSections.has(section.id)
                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                : 'bg-[#F95B0E] hover:bg-[#d94f0c] shadow-sm'
                            }`}
                          >
                            {enrolling === section.id
                              ? 'Enrolling...'
                              : pendingSections.has(section.id)
                              ? 'Pending'
                              : section._count.enrollments >= section.capacity
                              ? 'Full'
                              : 'Enroll'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
