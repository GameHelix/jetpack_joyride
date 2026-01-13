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
  MODERATOR: [
    { name: 'Dashboard', href: '/moderator', icon: '📊' },
    { name: 'Enrollments', href: '/moderator/enrollments', icon: '✅' },
    { name: 'Courses', href: '/moderator/courses', icon: '📚' },
  ],
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Top Navigation */}
      <nav className="bg-gradient-to-r from-[#5C2482] to-[#7B3FA3] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                href="/dashboard"
                className="flex items-center text-2xl font-bold text-white"
              >
                Educy
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition ${
                      pathname === item.href
                        ? 'bg-white/20 text-white'
                        : 'text-purple-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-purple-100">
                {session?.user?.name}
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-[#F95B0E] text-white rounded-full">
                {session?.user?.role}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-purple-100 hover:text-white transition px-3 py-2 rounded-lg hover:bg-white/10"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden border-t border-purple-400/30">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block pl-3 pr-4 py-2 text-base font-medium ${
                  pathname === item.href
                    ? 'bg-white/20 text-white border-l-4 border-white'
                    : 'text-purple-100 hover:bg-white/10 hover:text-white'
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
