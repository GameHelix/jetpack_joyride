import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const enrollmentRequestSchema = z.object({
  sectionId: z.string(),
})

// POST /api/enrollments/request - Request enrollment in a section
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Only students can request enrollment
    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { success: false, error: 'Only students can request enrollment' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = enrollmentRequestSchema.parse(body)

    // Get section details
    const section = await prisma.section.findUnique({
      where: { id: data.sectionId },
      include: {
        course: true,
        enrollments: {
          where: { status: 'ENROLLED' },
        },
      },
    })

    if (!section) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      )
    }

    // Check if already enrolled or pending
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_sectionId: {
          userId: user.id,
          sectionId: data.sectionId,
        },
      },
    })

    if (existing) {
      if (existing.status === 'ENROLLED') {
        return NextResponse.json(
          { success: false, error: 'You are already enrolled in this section' },
          { status: 409 }
        )
      } else if (existing.status === 'PENDING') {
        return NextResponse.json(
          { success: false, error: 'You already have a pending enrollment request for this section' },
          { status: 409 }
        )
      }
    }

    // Check capacity
    if (section.enrollments.length >= section.capacity) {
      return NextResponse.json(
        { success: false, error: 'Section is at full capacity' },
        { status: 409 }
      )
    }

    // Create enrollment request
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        sectionId: data.sectionId,
        status: 'PENDING',
      },
      include: {
        section: {
          include: {
            course: true,
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ENROLLMENT_REQUESTED',
        targetType: 'Enrollment',
        targetId: enrollment.id,
        details: {
          sectionId: data.sectionId,
          courseCode: section.course.code,
        },
      },
    })

    // Notify instructor
    await prisma.notification.create({
      data: {
        userId: section.instructorId,
        type: 'GENERAL',
        payload: {
          message: `New enrollment request from ${user.name} for ${section.course.code}`,
          enrollmentId: enrollment.id,
          studentName: user.name,
          courseCode: section.course.code,
        },
      },
    })

    return NextResponse.json({
      success: true,
      enrollment,
      message: 'Enrollment request submitted successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Enrollment request error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit enrollment request' },
      { status: 500 }
    )
  }
}
