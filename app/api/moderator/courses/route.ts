import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export const dynamic = 'force-dynamic'

// GET /api/moderator/courses - List all courses
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only moderators and admins can view all courses
    if (user.role !== 'MODERATOR' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only moderators can manage courses' },
        { status: 403 }
      )
    }

    // Fetch all courses with related data
    const courses = await prisma.course.findMany({
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            sections: true,
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      courses,
    })
  } catch (error) {
    console.error('Courses fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

// POST /api/moderator/courses - Update course visibility
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only moderators and admins can manage courses
    if (user.role !== 'MODERATOR' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only moderators can manage courses' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { courseId, action, visibility } = body

    if (!courseId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: courseId, action' },
        { status: 400 }
      )
    }

    if (action === 'toggle_visibility') {
      if (typeof visibility !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'Missing or invalid visibility value' },
          { status: 400 }
        )
      }

      // Fetch the course
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      })

      if (!course) {
        return NextResponse.json(
          { success: false, error: 'Course not found' },
          { status: 404 }
        )
      }

      // Update visibility
      await prisma.course.update({
        where: { id: courseId },
        data: { visibility },
      })

      // Audit log
      await createAuditLog({
        userId: user.id,
        action: visibility ? 'COURSE_VISIBILITY_ENABLED' : 'COURSE_VISIBILITY_DISABLED',
        targetType: 'Course',
        targetId: courseId,
        severity: 'WARNING',
        category: 'ADMIN_ACTION',
        details: {
          courseCode: course.code,
          courseTitle: course.title,
          visibility,
        },
      })

      return NextResponse.json({
        success: true,
        message: `Course visibility ${visibility ? 'enabled' : 'disabled'} successfully`,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Course action error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process course action' },
      { status: 500 }
    )
  }
}
