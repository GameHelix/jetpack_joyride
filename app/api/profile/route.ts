import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { rateLimitByIdentifier, RateLimitPresets } from '@/lib/ratelimit'

export const dynamic = 'force-dynamic'

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  surname: z.string().min(1).optional().nullable(),
  phone: z.string().optional().nullable(),
  expertise: z.array(z.string()).optional(),
  profileAvatarUrl: z.string().url().optional().nullable(),
})

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        phone: true,
        expertise: true,
        role: true,
        status: true,
        profileAvatarUrl: true,
        createdAt: true,
        lastLogin: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting for profile updates
    const rateLimit = rateLimitByIdentifier(
      request,
      'profile-update',
      session.user.id,
      {
        maxAttempts: 10,
        windowMs: 60 * 60 * 1000, // 1 hour
        message: 'Too many profile update attempts. Please try again later.',
      }
    )
    if (rateLimit) return rateLimit

    const body = await request.json()
    const data = updateProfileSchema.parse(body)

    // Build update object only with provided fields
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.surname !== undefined) updateData.surname = data.surname
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.profileAvatarUrl !== undefined) updateData.profileAvatarUrl = data.profileAvatarUrl

    // Only allow instructors, moderators, and admins to update expertise
    if (data.expertise !== undefined) {
      if (!['INSTRUCTOR', 'MODERATOR', 'ADMIN'].includes(session.user.role)) {
        return NextResponse.json(
          { success: false, error: 'Only instructors, moderators, and admins can set expertise' },
          { status: 403 }
        )
      }
      updateData.expertise = data.expertise
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        phone: true,
        expertise: true,
        role: true,
        status: true,
        profileAvatarUrl: true,
        createdAt: true,
        lastLogin: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PROFILE_UPDATED',
        targetType: 'User',
        targetId: session.user.id,
        details: {
          updatedFields: Object.keys(updateData),
        },
        severity: 'INFO',
        category: 'USER_ACTION',
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
