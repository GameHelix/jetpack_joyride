import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// DELETE /api/enrollments/[id] - Remove student from course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Only instructors, moderators, and admins can remove students
    if (!['INSTRUCTOR', 'MODERATOR', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Only instructors, moderators, and admins can remove students' },
        { status: 403 }
      )
    }

    // Get enrollment with section and course info
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true } },
        section: {
          include: {
            course: true,
            instructor: { select: { name: true, email: true } },
          },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Enrollment not found' }, { status: 404 })
    }

    // Check if user has permission to remove students from this section
    const hasPermission =
      user.role === 'ADMIN' ||
      user.role === 'MODERATOR' ||
      (user.role === 'INSTRUCTOR' && enrollment.section.instructorId === user.id)

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to remove students from this section' },
        { status: 403 }
      )
    }

    // Delete the enrollment
    await prisma.enrollment.delete({
      where: { id: params.id },
    })

    // Log unenrollment action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ENROLLMENT_REMOVED',
        targetType: 'Enrollment',
        targetId: enrollment.id,
        details: {
          studentId: enrollment.userId,
          studentName: enrollment.user.name,
          sectionId: enrollment.sectionId,
          courseCode: enrollment.section.course.code,
          removedBy: user.name,
          removedByRole: user.role,
        },
        severity: 'WARNING',
        category: 'USER_ACTION',
      },
    })

    return NextResponse.json({
      success: true,
      message: `${enrollment.user.name} has been removed from ${enrollment.section.course.code}`,
    })
  } catch (error) {
    console.error('Unenrollment error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove student from course' },
      { status: 500 }
    )
  }
}
