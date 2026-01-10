'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard-layout'

type Room = {
  id: string
  name: string
  location: string | null
  capacity: number
  resources: Record<string, any> | null
  createdAt: string
}

type RoomFormData = {
  name: string
  location: string
  capacity: number
  resources: Record<string, boolean>
}

export default function RoomsManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    location: '',
    capacity: 30,
    resources: {
      projector: false,
      whiteboard: false,
      computers: false,
      airConditioning: false,
    },
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }
    if (session.user.role !== 'ADMIN') {
      router.push('/unauthorized')
    }
  }, [session, status, router])

  // Fetch rooms
  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/rooms')
      const data = await response.json()

      if (data.success) {
        setRooms(data.rooms)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room)
      setFormData({
        name: room.name,
        location: room.location || '',
        capacity: room.capacity,
        resources: (room.resources as Record<string, boolean>) || {
          projector: false,
          whiteboard: false,
          computers: false,
          airConditioning: false,
        },
      })
    } else {
      setEditingRoom(null)
      setFormData({
        name: '',
        location: '',
        capacity: 30,
        resources: {
          projector: false,
          whiteboard: false,
          computers: false,
          airConditioning: false,
        },
      })
    }
    setShowModal(true)
    setError(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRoom(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const url = editingRoom
        ? `/api/admin/rooms/${editingRoom.id}`
        : '/api/admin/rooms'

      const method = editingRoom ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        await fetchRooms()
        handleCloseModal()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to save room')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (room: Room) => {
    if (!confirm(`Are you sure you want to delete room "${room.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/rooms/${room.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        await fetchRooms()
      } else {
        alert(data.error)
      }
    } catch (err) {
      alert('Failed to delete room')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout role={session?.user?.role || 'STUDENT'}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading rooms...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role={session?.user?.role || 'ADMIN'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Room Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage classroom and facility spaces
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-lg font-medium"
          >
            + Add Room
          </button>
        </div>

        {/* Rooms Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {rooms.length === 0 ? (
            <div className="text-center py-12">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <p className="mt-2 text-gray-500 dark:text-gray-400">No rooms found</p>
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 text-purple-600 dark:text-purple-400 hover:underline"
              >
                Create your first room
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Room Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Resources
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {room.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {room.location || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {room.capacity} people
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {room.resources && typeof room.resources === 'object' ? (
                            Object.entries(room.resources)
                              .filter(([_, value]) => value === true)
                              .map(([key]) => (
                                <span
                                  key={key}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                                >
                                  {key}
                                </span>
                              ))
                          ) : (
                            <span className="text-sm text-gray-400">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleOpenModal(room)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(room)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {editingRoom ? 'Edit Room' : 'Add New Room'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Room Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Room 101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Building A, 1st Floor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Capacity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="1000"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resources
                </label>
                <div className="space-y-2">
                  {Object.keys(formData.resources).map((resource) => (
                    <label key={resource} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.resources[resource]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            resources: {
                              ...formData.resources,
                              [resource]: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {resource.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingRoom ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
