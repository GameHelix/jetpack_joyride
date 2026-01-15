'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CourseActionsProps {
  courseId: string
  courseCode: string
  courseTitle: string
  hasEnrollments?: boolean
}

export function CourseActions({
  courseId,
  courseCode,
  courseTitle,
  hasEnrollments = false,
}: CourseActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (hasEnrollments) {
      alert('Cannot delete course with active enrollments. Please remove all students first.')
      return
    }

    const confirmed = confirm(
      `Are you sure you want to delete "${courseCode}: ${courseTitle}"?\n\nThis action cannot be undone and will delete all lessons, assignments, and related data.`
    )

    if (!confirmed) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete course')
      }

      if (data.success) {
        router.refresh()
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete course')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/instructor/courses/${courseId}`}
        className="px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-[#5C2482] border border-[#5C2482] rounded-xl hover:bg-purple-50 transition"
      >
        Manage
      </Link>
      <Link
        href={`/instructor/courses/${courseId}/edit`}
        className="px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium bg-[#F95B0E] text-white rounded-xl hover:bg-[#d94f0c] transition"
      >
        Edit
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium border border-red-600 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {deleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  )
}
