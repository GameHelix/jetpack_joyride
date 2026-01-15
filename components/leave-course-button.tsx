'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LeaveCourseButtonProps {
  enrollmentId: string
  courseCode: string
  courseTitle: string
}

export function LeaveCourseButton({
  enrollmentId,
  courseCode,
  courseTitle,
}: LeaveCourseButtonProps) {
  const router = useRouter()
  const [leaving, setLeaving] = useState(false)

  const handleLeave = async () => {
    const confirmed = confirm(
      `Are you sure you want to leave "${courseCode}: ${courseTitle}"?\n\nYou will need to re-enroll to access the course again.`
    )

    if (!confirmed) return

    setLeaving(true)
    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to leave course')
      }

      if (data.success) {
        alert('You have left the course successfully')
        router.refresh()
      }
    } catch (error) {
      console.error('Leave course error:', error)
      alert(error instanceof Error ? error.message : 'Failed to leave course')
    } finally {
      setLeaving(false)
    }
  }

  return (
    <button
      onClick={handleLeave}
      disabled={leaving}
      className="px-3 py-1.5 text-xs font-semibold border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {leaving ? 'Leaving...' : 'Leave Course'}
    </button>
  )
}
