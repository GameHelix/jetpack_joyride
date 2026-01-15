import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireInstructor } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createRoomSchema = z.object({
  sectionId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
})

// POST /api/case-rooms - Create new case room
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = await requireInstructor()
    const body = await request.json()
    const data = createRoomSchema.parse(body)

    const section = await prisma.section.findUnique({
      where: { id: data.sectionId },
    })

    if (!section || (section.instructorId !== user.id && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const room = await prisma.caseRoom.create({
      data: {
        sectionId: data.sectionId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        createdById: user.id,
      },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      room,
      message: 'Case room created successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Case room creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create case room' },
      { status: 500 }
    )
  }
}

// GET /api/case-rooms - List case rooms
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('sectionId')

    let where: any = {}

    if (session.user.role === 'INSTRUCTOR') {
      where.section = { instructorId: session.user.id }
    } else if (session.user.role === 'STUDENT') {
      where.section = {
        enrollments: {
          some: {
            userId: session.user.id,
            status: 'ENROLLED',
          },
        },
      }
    }

    if (sectionId) {
      where.sectionId = sectionId
    }

    const rooms = await prisma.caseRoom.findMany({
      where,
      include: {
        section: {
          include: {
            course: true,
          },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      rooms,
    })
  } catch (error) {
    console.error('Case room fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch case rooms' },
      { status: 500 }
    )
  }
}
