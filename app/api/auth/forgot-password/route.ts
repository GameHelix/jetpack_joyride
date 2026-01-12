import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

// POST /api/auth/forgot-password - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = forgotPasswordSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      })
    }

    // Generate secure reset token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`

    // Send password reset email
    try {
      await sendPasswordResetEmail({
        to: user.email,
        userName: user.name,
        resetUrl,
      })
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // Don't fail the request if email fails - token is still valid
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        targetType: 'User',
        targetId: user.id,
        severity: 'INFO',
        category: 'SECURITY',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}
