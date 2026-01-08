import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { requireAdmin } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  try {
    await requireAdmin()
  } catch {
    redirect('/unauthorized')
  }

  // Fetch system statistics
  const [totalUsers, totalCourses, totalSections, totalEnrollments, totalRooms, recentAuditLogs] =
    await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.section.count(),
      prisma.enrollment.count({ where: { status: 'ENROLLED' } }),
      prisma.room.count(),
      prisma.auditLog.findMany({
        where: {
          OR: [
            { severity: 'CRITICAL' },
            { severity: 'WARNING' }
          ]
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

  // Get user counts by role
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: true,
  })

  const roleStats = usersByRole.reduce(
    (acc, { role, _count }) => {
      acc[role] = _count
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <DashboardLayout role={session.user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            System overview and management
          </p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/admin/users"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition group"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-300"
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
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {totalUsers}
                </p>
              </div>
            </div>
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-300"
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
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Courses
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalCourses}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/admin/rooms"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition group"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Rooms
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {totalRooms}
                </p>
              </div>
            </div>
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                <svg
                  className="w-6 h-6 text-orange-600 dark:text-orange-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Enrollments
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalEnrollments}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Stats by Role */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Users by Role
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {roleStats.ADMIN || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Admins</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {roleStats.INSTRUCTOR || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Instructors</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {roleStats.MODERATOR || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Moderators</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {roleStats.STUDENT || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Students</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/users"
                className="flex items-center justify-center px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition group"
              >
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-blue-500"
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
                <span className="ml-3 font-medium text-gray-900 dark:text-white">
                  Manage Users
                </span>
              </Link>

              <Link
                href="/admin/rooms"
                className="flex items-center justify-center px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition group"
              >
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span className="ml-3 font-medium text-gray-900 dark:text-white">
                  Manage Rooms
                </span>
              </Link>

              <Link
                href="/admin/audit-logs"
                className="flex items-center justify-center px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 dark:hover:border-green-400 transition group"
              >
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-green-500"
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
                <span className="ml-3 font-medium text-gray-900 dark:text-white">
                  View Audit Logs
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Important Activity
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Critical and warning events (excluding routine logins)
              </p>
            </div>
            <Link
              href="/admin/audit-logs"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="p-6">
            {recentAuditLogs.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {recentAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start space-x-3 text-sm p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white">
                        <span className="font-medium">
                          {log.user?.name || 'System'}
                        </span>{' '}
                        - {log.action}
                      </p>
                      {log.targetType && (
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                          Target: {log.targetType} ({log.targetId})
                        </p>
                      )}
                      <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
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
