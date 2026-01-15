/**
 * Content Aging System
 * Tracks and analyzes the age of course content to prompt instructors for updates
 */

export type ContentStatus = 'fresh' | 'current' | 'aging' | 'outdated'

export interface ContentItem {
  id: string
  title: string
  updatedAt: Date
  type?: 'lesson' | 'assignment' | 'material'
  section?: {
    id: string
    course: {
      code: string
      title: string
    }
  }
}

export interface ContentAgeStats {
  total: number
  fresh: number // < 30 days
  current: number // 30-90 days
  aging: number // 90-180 days
  outdated: number // > 180 days
  needsReview: number // aging + outdated
}

/**
 * Determine content status based on last update date
 */
export function getContentStatus(updatedAt: Date): ContentStatus {
  const now = new Date()
  const daysSinceUpdate = Math.floor((now.getTime() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24))

  if (daysSinceUpdate < 30) return 'fresh'
  if (daysSinceUpdate < 90) return 'current'
  if (daysSinceUpdate < 180) return 'aging'
  return 'outdated'
}

/**
 * Get color indicator for content status
 */
export function getStatusColor(status: ContentStatus): string {
  const colors = {
    fresh: 'text-green-600 bg-green-100',
    current: 'text-blue-600 bg-blue-100',
    aging: 'text-yellow-600 bg-yellow-100',
    outdated: 'text-red-600 bg-red-100',
  }
  return colors[status]
}

/**
 * Get icon for content status
 */
export function getStatusIcon(status: ContentStatus): string {
  const icons = {
    fresh: '✨',
    current: '✓',
    aging: '⏰',
    outdated: '⚠️',
  }
  return icons[status]
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: ContentStatus): string {
  const labels = {
    fresh: 'Fresh',
    current: 'Current',
    aging: 'Needs Review',
    outdated: 'Outdated',
  }
  return labels[status]
}

/**
 * Calculate days since last update
 */
export function getDaysSinceUpdate(updatedAt: Date): number {
  const now = new Date()
  return Math.floor((now.getTime() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Get content aging statistics for a collection of content items
 */
export function getContentAgeStats(content: ContentItem[]): ContentAgeStats {
  const stats: ContentAgeStats = {
    total: content.length,
    fresh: 0,
    current: 0,
    aging: 0,
    outdated: 0,
    needsReview: 0,
  }

  content.forEach((item) => {
    const status = getContentStatus(item.updatedAt)
    stats[status]++
  })

  stats.needsReview = stats.aging + stats.outdated

  return stats
}

/**
 * Filter content by age status
 */
export function filterByAgeStatus(
  content: ContentItem[],
  statuses: ContentStatus[]
): ContentItem[] {
  return content.filter((item) => {
    const status = getContentStatus(item.updatedAt)
    return statuses.includes(status)
  })
}

/**
 * Sort content by age (oldest first)
 */
export function sortByAge(content: ContentItem[], desc = false): ContentItem[] {
  return [...content].sort((a, b) => {
    const dateA = new Date(a.updatedAt).getTime()
    const dateB = new Date(b.updatedAt).getTime()
    return desc ? dateB - dateA : dateA - dateB
  })
}

/**
 * Group content by status
 */
export function groupByStatus(content: ContentItem[]): Record<ContentStatus, ContentItem[]> {
  const grouped: Record<ContentStatus, ContentItem[]> = {
    fresh: [],
    current: [],
    aging: [],
    outdated: [],
  }

  content.forEach((item) => {
    const status = getContentStatus(item.updatedAt)
    grouped[status].push(item)
  })

  return grouped
}

/**
 * Check if content needs review (aging or outdated)
 */
export function needsReview(updatedAt: Date): boolean {
  const status = getContentStatus(updatedAt)
  return status === 'aging' || status === 'outdated'
}

/**
 * Get recommended update frequency message
 */
export function getUpdateRecommendation(status: ContentStatus): string {
  const recommendations = {
    fresh: 'Content is up to date. Review again in 30 days.',
    current: 'Content is still current. Consider reviewing within 60 days.',
    aging: 'Content is aging. Review and update recommended within 30 days.',
    outdated: 'Content is outdated. Immediate review and update recommended.',
  }
  return recommendations[status]
}
