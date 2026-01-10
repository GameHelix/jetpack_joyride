'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { RoleName } from '@prisma/client'

interface DashboardLayoutProps {
  children: ReactNode
  role: RoleName
}

const navigationByRole: Record<
  RoleName,
  Array<{
    name: string
    href: string
    icon: string
  }>
> = {
  ADMIN: [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Rooms', href: '/admin/rooms', icon: '🏢' },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: '📋' },
  ],
  INSTRUCTOR: [
    { name: 'Dashboard', href: '/instructor', icon: '📊' },
    { name: 'Courses', href: '/instructor/courses', icon: '📚' },
    { name: 'Assignments', href: '/instructor/assignments', icon: '📝' },
    { name: 'Schedule', href: '/instructor/schedule', icon: '📅' },
  ],
  MODERATOR: [],
  STUDENT: [
    { name: 'Dashboard', href: '/student', icon: '📊' },
    { name: 'Courses', href: '/student/courses', icon: '📚' },
    { name: 'Timetable', href: '/student/timetable', icon: '📅' },
    { name: 'Assignments', href: '/student/assignments', icon: '📝' },
  ],
}

function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const navigation = navigationByRole[role]
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                href="/dashboard"
                className="flex items-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              >
                Educy
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition ${
                      pathname === item.href
                        ? 'border-blue-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {session?.user?.name}
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                {session?.user?.role}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname === item.href
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
export { DashboardLayout }
