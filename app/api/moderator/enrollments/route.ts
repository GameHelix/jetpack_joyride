import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { auditLog } from '@/lib/audit'

export const dynamic = 'force-dynamic'

// GET /api/moderator/enrollments - List all enrollments
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only moderators and admins can view all enrollments
    if (user.role !== 'MODERATOR' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only moderators can manage enrollments' },
        { status: 403 }
      )
    }

    // Fetch all enrollments with related data
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        section: {
          include: {
            course: {
              select: {
                code: true,
                title: true,
                description: true,
              },
            },
            instructor: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                enrollments: {
                  where: {
                    status: 'ENROLLED',
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      enrollments,
    })
  } catch (error) {
    console.error('Enrollments fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}

// POST /api/moderator/enrollments - Approve or reject enrollment
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only moderators and admins can manage enrollments
    if (user.role !== 'MODERATOR' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only moderators can manage enrollments' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { enrollmentId, action } = body

    if (!enrollmentId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: enrollmentId, action' },
        { status: 400 }
      )
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Fetch the enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        section: {
          include: {
            course: true,
            _count: {
              select: {
                enrollments: {
                  where: {
                    status: 'ENROLLED',
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    // Check if already processed
    if (enrollment.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: `Enrollment already ${enrollment.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Check capacity
      const currentEnrollments = enrollment.section._count.enrollments
      const capacity = enrollment.section.capacity

      if (currentEnrollments >= capacity) {
        return NextResponse.json(
          { success: false, error: 'Section is at full capacity' },
          { status: 400 }
        )
      }

      // Approve enrollment
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { status: 'ENROLLED' },
      })

      // Create notification for student
      await prisma.notification.create({
        data: {
          userId: enrollment.user.id,
          type: 'ENROLLMENT_APPROVED',
          payload: {
            enrollmentId: enrollment.id,
            courseCode: enrollment.section.course.code,
            courseTitle: enrollment.section.course.title,
          },
        },
      })

      // Audit log
      await auditLog.enrollmentApproved(user.id, enrollment.id, {
        studentId: enrollment.user.id,
        studentName: enrollment.user.name,
        courseCode: enrollment.section.course.code,
        courseTitle: enrollment.section.course.title,
      })

      return NextResponse.json({
        success: true,
        message: 'Enrollment approved successfully',
      })
    } else {
      // Reject enrollment
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { status: 'REJECTED' },
      })

      // Create notification for student
      await prisma.notification.create({
        data: {
          userId: enrollment.user.id,
          type: 'ENROLLMENT_REJECTED',
          payload: {
            enrollmentId: enrollment.id,
            courseCode: enrollment.section.course.code,
            courseTitle: enrollment.section.course.title,
          },
        },
      })

      // Audit log
      await auditLog.enrollmentRejected(user.id, enrollment.id, {
        studentId: enrollment.user.id,
        studentName: enrollment.user.name,
        courseCode: enrollment.section.course.code,
        courseTitle: enrollment.section.course.title,
      })

      return NextResponse.json({
        success: true,
        message: 'Enrollment rejected successfully',
      })
    }
  } catch (error) {
    console.error('Enrollment action error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process enrollment' },
      { status: 500 }
    )
  }
}
