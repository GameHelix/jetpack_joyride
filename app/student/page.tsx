import { getCurrentUser } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'


export default async function StudentDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get student enrollments
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id, status: 'ENROLLED' },
    include: {
      section: {
        include: {
          course: true,
          instructor: { select: { name: true } },
        },
      },
    },
  })

  // Get upcoming assignments
  const upcomingAssignments = await prisma.assignment.findMany({
    where: {
      section: {
        enrollments: {
          some: {
            userId: user.id,
            status: 'ENROLLED',
          },
        },
      },
      dueDate: {
        gte: new Date(),
      },
    },
    include: {
      section: {
        include: {
          course: true,
        },
      },
      submissions: {
        where: { studentId: user.id },
      },
    },
    orderBy: { dueDate: 'asc' },
    take: 5,
  })

  // Get recent notifications
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return (
    <DashboardLayout role={user.role}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#5C2482] to-[#7B3FA3] rounded-xl shadow-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-purple-100">
            Here's what's happening in your courses today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5C2482]">
                  Enrolled Courses
                </p>
                <p className="text-3xl font-bold text-[#5C2482] mt-2">
                  {enrollments.length}
                </p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5C2482]">
                  Pending Assignments
                </p>
                <p className="text-3xl font-bold text-[#5C2482] mt-2">
                  {upcomingAssignments.filter(a => a.submissions.length === 0).length}
                </p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5C2482]">
                  Unread Notifications
                </p>
                <p className="text-3xl font-bold text-[#5C2482] mt-2">
                  {notifications.filter(n => !n.readAt).length}
                </p>
              </div>
              <div className="text-4xl">🔔</div>
            </div>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="bg-white rounded-xl shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-[#5C2482]">
              Upcoming Assignments
            </h2>
          </div>
          <div className="p-6">
            {upcomingAssignments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No upcoming assignments
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingAssignments.map((assignment) => {
                  const isSubmitted = assignment.submissions.length > 0
                  const daysUntilDue = Math.ceil(
                    (assignment.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  )

                  return (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-[#5C2482]">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {assignment.section.course.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Due: {assignment.dueDate.toLocaleDateString()}
                          {daysUntilDue <= 3 && !isSubmitted && (
                            <span className="ml-2 text-red-600 font-medium">
                              (Due in {daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'})
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {isSubmitted ? (
                          <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                            Submitted
                          </span>
                        ) : (
                          <Link
                            href={`/student/assignments/${assignment.id}`}
                            className="px-4 py-2 bg-[#F95B0E] hover:bg-[#d94f0c] text-white rounded-xl transition text-sm font-medium"
                          >
                            Submit
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* My Courses */}
        <div className="bg-white rounded-xl shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-[#5C2482]">
              My Courses
            </h2>
          </div>
          <div className="p-6">
            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  You're not enrolled in any courses yet.
                </p>
                <Link
                  href="/student/courses"
                  className="inline-block px-6 py-3 bg-[#F95B0E] hover:bg-[#d94f0c] text-white rounded-xl transition font-medium"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                  >
                    <h3 className="font-bold text-[#5C2482]">
                      {enrollment.section.course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {enrollment.section.course.code} • {enrollment.section.term}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Instructor: {enrollment.section.instructor.name}
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
