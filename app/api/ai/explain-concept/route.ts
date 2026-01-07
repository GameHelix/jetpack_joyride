import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/rbac'
import { explainConcept } from '@/lib/ai'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const explainConceptSchema = z.object({
  courseId: z.string(),
  topic: z.string().min(3).max(200),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
})

// POST /api/ai/explain-concept - Get AI explanation of concepts
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = explainConceptSchema.parse(body)

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
      include: {
        sections: {
          include: {
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

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    // Students must be enrolled, instructors/admins can access any
    if (user.role === 'STUDENT') {
      const isEnrolled = course.sections.some((s) => s.enrollments.length > 0)
      if (!isEnrolled) {
        return NextResponse.json(
          { success: false, error: 'You are not enrolled in this course' },
          { status: 403 }
        )
      }
    }

    // Get AI explanation
    const explanation = await explainConcept({
      courseName: `${course.code}: ${course.title}`,
      topic: data.topic,
      difficulty: data.difficulty,
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'AI_CONCEPT_EXPLAIN',
        targetType: 'Course',
        targetId: data.courseId,
        details: {
          topic: data.topic,
          difficulty: data.difficulty,
        },
      },
    })

    return NextResponse.json({
      success: true,
      explanation,
      message: 'Concept explained',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('AI explain concept error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to explain concept' },
      { status: 500 }
    )
  }
}
