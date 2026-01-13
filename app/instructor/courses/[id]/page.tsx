import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { requireInstructor } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  try {
    await requireInstructor()
  } catch {
    redirect('/unauthorized')
  }

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      sections: {
        include: {
          instructor: {
            select: {
              name: true,
              email: true,
            },
          },
          lessons: {
            include: {
              room: true,
            },
            orderBy: {
              dayOfWeek: 'asc',
            },
          },
          assignments: {
            include: {
              _count: {
                select: {
                  submissions: true,
                },
              },
            },
            orderBy: {
              dueDate: 'desc',
            },
          },
          enrollments: {
            where: {
              status: 'ENROLLED',
            },
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!course) {
    notFound()
  }

  // Check access
  const hasAccess =
    course.sections.some((s) => s.instructorId === session.user.id) ||
    course.createdById === session.user.id ||
    session.user.role === 'ADMIN'

  if (!hasAccess) {
    redirect('/unauthorized')
  }

  const section = course.sections[0] // First section

  return (
    <DashboardLayout role={session.user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-[#5C2482]">
                {course.code}: {course.title}
              </h1>
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  course.visibility
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {course.visibility ? 'Visible' : 'Hidden'}
              </span>
            </div>
            <p className="mt-2 text-gray-600">{course.term}</p>
            {course.description && (
              <p className="mt-3 text-gray-700">
                {course.description}
              </p>
            )}
          </div>
          <Link
            href={`/instructor/courses/${course.id}/edit`}
            className="px-4 py-2 bg-[#F95B0E] text-white rounded-xl hover:bg-[#d94f0c] transition"
          >
            Edit Course
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm font-medium text-gray-600">
              Students
            </p>
            <p className="text-3xl font-bold text-[#5C2482] mt-2">
              {section?.enrollments.length || 0}/{section?.capacity || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm font-medium text-gray-600">
              Lessons
            </p>
            <p className="text-3xl font-bold text-[#5C2482] mt-2">
              {section?.lessons.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm font-medium text-gray-600">
              Assignments
            </p>
            <p className="text-3xl font-bold text-[#5C2482] mt-2">
              {section?.assignments.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm font-medium text-gray-600">
              Instructor
            </p>
            <p className="text-sm font-medium text-[#5C2482] mt-2">
              {section?.instructor.name || 'N/A'}
            </p>
          </div>
        </div>

        {/* Lessons */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#5C2482]">
              Lessons
            </h2>
            {section && (
              <Link
                href={`/instructor/courses/${section.id}/lessons/new`}
                className="px-4 py-2 bg-[#F95B0E] text-white rounded-xl hover:bg-[#d94f0c] transition text-sm"
              >
                + Add Lesson
              </Link>
            )}
          </div>
          <div className="p-6">
            {!section || section.lessons.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No lessons yet. Create your first lesson to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {section.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                  >
                    <div>
                      <h3 className="font-medium text-[#5C2482]">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {lesson.dayOfWeek} • {lesson.startTime} - {lesson.endTime}
                        {lesson.room && ` • ${lesson.room.name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assignments */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#5C2482]">
              Assignments
            </h2>
            {section && (
              <Link
                href={`/instructor/courses/${section.id}/assignments/new`}
                className="px-4 py-2 bg-[#F95B0E] text-white rounded-xl hover:bg-[#d94f0c] transition text-sm"
              >
                + Create Assignment
              </Link>
            )}
          </div>
          <div className="p-6">
            {!section || section.assignments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No assignments yet.
              </p>
            ) : (
              <div className="space-y-3">
                {section.assignments.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/instructor/assignments/${assignment.id}`}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition"
                  >
                    <div>
                      <h3 className="font-medium text-[#5C2482]">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()} •{' '}
                        {assignment._count.submissions} submissions
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enrolled Students */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[#5C2482]">
              Enrolled Students ({section?.enrollments.length || 0})
            </h2>
          </div>
          <div className="p-6">
            {!section || section.enrollments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No students enrolled yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="p-4 border border-gray-200 rounded-xl"
                  >
                    <p className="font-medium text-[#5C2482]">
                      {enrollment.user.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {enrollment.user.email}
                    </p>
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
