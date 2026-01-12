import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/rbac'
import { generateUploadUrl, generateFileKey, validateFileType, validateFileSize } from '@/lib/r2'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const uploadUrlSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().positive(),
  allowedTypes: z.array(z.string()).optional(),
  maxSizeBytes: z.number().positive().optional().default(10485760), // 10MB default
  prefix: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const data = uploadUrlSchema.parse(body)

    // Validate file type if allowedTypes is provided
    if (data.allowedTypes && !validateFileType(data.filename, data.allowedTypes)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${data.allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (!validateFileSize(data.sizeBytes, data.maxSizeBytes)) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${data.maxSizeBytes} bytes` },
        { status: 400 }
      )
    }

    // Generate unique file key
    const fileKey = generateFileKey(user.id, data.filename, data.prefix)

    // Generate signed upload URL
    const uploadUrl = await generateUploadUrl(fileKey, data.contentType)

    // Create file record in database with PENDING status
    const file = await prisma.file.create({
      data: {
        ownerId: user.id,
        key: fileKey,
        filename: data.filename,
        mimeType: data.contentType,
        sizeBytes: data.sizeBytes,
        status: 'PENDING', // Will be updated to UPLOADED after successful upload
      },
    })

    return NextResponse.json({
      uploadUrl,
      fileId: file.id,
      fileKey,
    })
  } catch (error) {
    console.error('Error generating upload URL:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}
