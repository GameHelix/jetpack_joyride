import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/rbac'
import { getStudentHelp } from '@/lib/ai'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const studentHelpSchema = z.object({
  assignmentId: z.string(),
  question: z.string().min(10).max(1000),
})

// POST /api/ai/student-help - Get AI assistance for assignments
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Students can use this, instructors can test it
    if (user.role !== 'STUDENT' && user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = studentHelpSchema.parse(body)

    // Get assignment details
    const assignment = await prisma.assignment.findUnique({
      where: { id: data.assignmentId },
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
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Students must be enrolled, instructors/admins can access any
    if (
      user.role === 'STUDENT' &&
      assignment.section.enrollments.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: 'You are not enrolled in this course' },
        { status: 403 }
      )
    }

    // Get AI help
    const aiResponse = await getStudentHelp({
      assignmentTitle: assignment.title,
      assignmentDescription: assignment.description || 'No description provided',
      studentQuestion: data.question,
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'AI_STUDENT_HELP',
        targetType: 'Assignment',
        targetId: data.assignmentId,
        details: {
          question: data.question,
          responseLength: aiResponse.length,
        },
      },
    })

    return NextResponse.json({
      success: true,
      response: aiResponse,
      message: 'AI assistance provided',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('AI student help error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get AI assistance' },
      { status: 500 }
    )
  }
}
