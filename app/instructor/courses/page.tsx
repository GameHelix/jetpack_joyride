import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { requireInstructor } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'

export default async function InstructorCoursesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  try {
    await requireInstructor()
  } catch {
    redirect('/unauthorized')
  }

  const userId = session.user.id

  // Fetch instructor's sections with course details
  const sections = await prisma.section.findMany({
    where: { instructorId: userId },
    include: {
      course: true,
      _count: {
        select: {
          enrollments: true,
          assignments: true,
          lessons: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <DashboardLayout role={session.user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#5C2482]">
              My Courses
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your courses and sections
            </p>
          </div>
          <Link
            href="/instructor/courses/new"
            className="px-4 py-2 sm:px-6 sm:py-3 bg-[#F95B0E] text-white rounded-xl hover:bg-[#d94f0c] transition font-medium"
          >
            + Create Course
          </Link>
        </div>

        {/* Courses List */}
        <div className="bg-white rounded-xl shadow">
          {sections.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-[#5C2482]">
                No courses yet
              </h3>
              <p className="mt-1 text-gray-500">
                Get started by creating your first course.
              </p>
              <div className="mt-6">
                <Link
                  href="/instructor/courses/new"
                  className="inline-flex items-center px-3 py-2 sm:px-4 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-[#F95B0E] hover:bg-[#d94f0c]"
                >
                  + Create Course
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="p-6 hover:bg-gray-50/50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        href={`/instructor/courses/${section.course.id}`}
                        className="group"
                      >
                        <h3 className="text-lg font-semibold text-[#5C2482] group-hover:text-[#5C2482]">
                          {section.course.code}: {section.course.title}
                        </h3>
                      </Link>
                      {section.course.description && (
                        <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2">
                          {section.course.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center space-x-6 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg
                            className="mr-1.5 h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {section.term}
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="mr-1.5 h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                          {section._count.enrollments} / {section.capacity} students
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="mr-1.5 h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                          {section._count.lessons} lessons
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="mr-1.5 h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          {section._count.assignments} assignments
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <Link
                        href={`/instructor/courses/${section.course.id}`}
                        className="px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-[#5C2482] border border-blue-600 rounded-xl hover:bg-blue-50 transition"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
