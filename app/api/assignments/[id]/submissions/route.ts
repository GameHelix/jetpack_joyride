import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createSubmissionSchema = z.object({
  fileKey: z.string().optional(),
  text: z.string().optional(),
}).refine(data => data.fileKey || data.text, {
  message: "Either fileKey or text must be provided for submission"
})

// POST /api/assignments/[id]/submissions - Submit assignment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createSubmissionSchema.parse(body)

    // Get assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
      include: {
        section: {
          include: {
            course: true,
            enrollments: {
              where: {
                userId: user.id,
                status: 'ENROLLED',
              },
            },
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 })
    }

    // Check if student is enrolled
    if (user.role === 'STUDENT' && assignment.section.enrollments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'You are not enrolled in this course' },
        { status: 403 }
      )
    }

    // Check if already submitted
    const existing = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: params.id,
          studentId: user.id,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted this assignment' },
        { status: 409 }
      )
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        assignmentId: params.id,
        studentId: user.id,
        fileKey: data.fileKey,
        text: data.text,
      },
      include: {
        assignment: {
          include: {
            section: {
              include: {
                course: true,
              },
            },
          },
        },
        student: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ASSIGNMENT_SUBMITTED',
        targetType: 'Submission',
        targetId: submission.id,
        details: {
          assignmentId: params.id,
          course: assignment.section.course.code,
        },
      },
    })

    return NextResponse.json({
      success: true,
      submission,
      message: 'Assignment submitted successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Submission creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit assignment' },
      { status: 500 }
    )
  }
}

// GET /api/assignments/[id]/submissions - List submissions (instructor only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
      include: {
        section: true,
      },
    })

    if (!assignment) {
      return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 })
    }

    // Only instructor can view all submissions
    if (assignment.section.instructorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const submissions = await prisma.submission.findMany({
      where: { assignmentId: params.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      submissions,
    })
  } catch (error) {
    console.error('Submissions fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}
