import { NextRequest, NextResponse } from 'next/server'
import { requireInstructor } from '@/lib/rbac'
import { getGradingAssistance, generateFeedbackSuggestions } from '@/lib/ai'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const gradingAssistSchema = z.object({
  submissionId: z.string(),
  mode: z.enum(['full', 'feedback-only']).default('full'),
  currentGrade: z.number().min(0).max(100).optional(),
})

// POST /api/ai/grading-assist - Get AI grading assistance
export async function POST(request: NextRequest) {
  try {
    const user = await requireInstructor()
    const body = await request.json()
    const data = gradingAssistSchema.parse(body)

    // Get submission with assignment details
    const submission = await prisma.submission.findUnique({
      where: { id: data.submissionId },
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
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Check if user is instructor of this section
    if (
      submission.assignment.section.instructorId !== user.id &&
      user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check if submission has text content
    if (!submission.text || submission.text.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot analyze submission without text content. Please review the submitted file manually.',
        },
        { status: 400 }
      )
    }

    let aiResponse

    if (data.mode === 'feedback-only' && data.currentGrade !== undefined) {
      // Generate feedback suggestions for an already-graded submission
      const feedback = await generateFeedbackSuggestions(
        submission.assignment.description || submission.assignment.title,
        submission.text,
        data.currentGrade
      )

      aiResponse = {
        feedback,
        mode: 'feedback-only' as const,
      }
    } else {
      // Full grading assistance
      const analysis = await getGradingAssistance({
        assignmentTitle: submission.assignment.title,
        assignmentDescription:
          submission.assignment.description || 'No description provided',
        submissionText: submission.text,
        maxGrade: 100,
      })

      aiResponse = {
        ...analysis,
        mode: 'full' as const,
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'AI_GRADING_ASSIST',
        targetType: 'Submission',
        targetId: data.submissionId,
        details: {
          mode: data.mode,
          studentId: submission.student.id,
          studentName: submission.student.name,
          assignmentTitle: submission.assignment.title,
        },
      },
    })

    return NextResponse.json({
      success: true,
      analysis: aiResponse,
      message: 'AI grading assistance provided',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('AI grading assist error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get AI grading assistance' },
      { status: 500 }
      )
  }
}
