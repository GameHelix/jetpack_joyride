import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getCaseRooms() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/case-rooms`, {
    headers: {
      'Cookie': `next-auth.session-token=${session.user.id}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) return []
  const data = await response.json()
  return data.rooms || []
}

export default async function InstructorCaseRoomsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['INSTRUCTOR', 'ADMIN'].includes(session.user.role)) {
    redirect('/signin')
  }

  const rooms = await getCaseRooms()
  const activeRooms = rooms.filter((room: any) => room.isActive)
  const closedRooms = rooms.filter((room: any) => !room.isActive)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Case Rooms</h1>
            <p className="text-sm md:text-base text-gray-600">Manage student case submissions</p>
          </div>
          <Link
            href="/instructor/case-rooms/new"
            className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-colors inline-flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Case Room
          </Link>
        </div>

        {/* Active Rooms */}
        {activeRooms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-purple-800 mb-4">Active Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRooms.map((room: any) => {
                const pendingCount = room.posts?.filter((p: any) => p.isApproved === null).length || 0

                return (
                  <Link
                    key={room.id}
                    href={`/instructor/case-rooms/${room.id}`}
                    className={`bg-white border-2 rounded-xl p-6 hover:shadow-lg transition-all ${
                      pendingCount > 0 ? 'border-yellow-300' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex-1">{room.title}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ml-2">
                        ACTIVE
                      </span>
                    </div>

                    {room.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{room.description}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Posts:</span>
                        <span className="font-medium text-gray-900">{room._count.posts}</span>
                      </div>
                      {pendingCount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-yellow-700">Pending Review:</span>
                          <span className="font-bold text-yellow-700">{pendingCount}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {room.section.course.code}
                      </div>
                    </div>

                    {room.dueDate && (
                      <div className="text-xs text-gray-600">
                        Due: {new Date(room.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Closed Rooms */}
        {closedRooms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Closed Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {closedRooms.map((room: any) => (
                <Link
                  key={room.id}
                  href={`/instructor/case-rooms/${room.id}`}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">{room.title}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 ml-2">
                      CLOSED
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Posts:</span>
                      <span className="font-medium text-gray-900">{room._count.posts}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {room.section.course.code}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {rooms.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No case rooms yet</h3>
            <p className="text-gray-600 mb-6">Create your first case room for student submissions</p>
            <Link
              href="/instructor/case-rooms/new"
              className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Case Room
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
