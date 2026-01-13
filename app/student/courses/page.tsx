'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'

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
            <div className="bg-white rounded-xl shadow border border-gray-200 p-8 text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500">
                You're not enrolled in any courses yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-white rounded-xl shadow border border-gray-200 hover:shadow-xl transition"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-[#5C2482] rounded-full">
                          {enrollment.section.course.code}
                        </span>
                      </div>
                      <span className="text-green-600 text-sm font-medium">
                        Enrolled
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#5C2482] mb-2">
                      {enrollment.section.course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {enrollment.section.course.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <strong>Instructor:</strong> {enrollment.section.instructor.name}
                      </p>
                      <p className="text-gray-600">
                        <strong>Term:</strong> {enrollment.section.term}
                      </p>
                      <p className="text-gray-600">
                        <strong>Students:</strong> {enrollment.section._count.enrollments}/{enrollment.section.capacity}
                      </p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow border border-gray-200 hover:shadow-xl transition"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-[#5C2482] rounded-full">
                        {course.code}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#5C2482] mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="space-y-2 text-sm mb-4">
                      {course.sections.map((section) => (
                        <div
                          key={section.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="text-gray-700">
                              {section.instructor.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {section.term} • {section._count.enrollments}/{section.capacity} students
                            </p>
                          </div>
                          <button
                            onClick={() => handleEnroll(section.id)}
                            disabled={
                              section._count.enrollments >= section.capacity ||
                              enrolling === section.id ||
                              pendingSections.has(section.id)
                            }
                            className={`px-3 py-1 text-white rounded-lg transition text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                              pendingSections.has(section.id)
                                ? 'bg-yellow-500'
                                : 'bg-[#F95B0E] hover:bg-[#d94f0c]'
                            }`}
                          >
                            {enrolling === section.id
                              ? 'Enrolling...'
                              : pendingSections.has(section.id)
                              ? 'Pending Approval'
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
