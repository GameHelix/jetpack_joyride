import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/files/[id]/confirm - Confirm successful upload
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[FILE CONFIRM] Confirming upload for file:', params.id)

    const user = await requireAuth()
    console.log('[FILE CONFIRM] User authenticated:', user.id)

    // Get file record
    const file = await prisma.file.findUnique({
      where: { id: params.id },
    })

    if (!file) {
      console.log('[FILE CONFIRM] File not found:', params.id)
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    console.log('[FILE CONFIRM] File found:', file.key, 'owner:', file.ownerId)

    // Only file owner can confirm upload
    if (file.ownerId !== user.id && user.role !== 'ADMIN') {
      console.log('[FILE CONFIRM] Permission denied - not owner')
      return NextResponse.json(
        { error: 'You do not have permission to confirm this upload' },
        { status: 403 }
      )
    }

    // Update file status to UPLOADED
    const updatedFile = await prisma.file.update({
      where: { id: params.id },
      data: { status: 'UPLOADED' },
    })

    console.log('[FILE CONFIRM] File status updated to UPLOADED')

    return NextResponse.json({
      success: true,
      file: updatedFile,
    })
  } catch (error) {
    console.error('[FILE CONFIRM] Error confirming upload:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to confirm upload' },
      { status: 500 }
    )
  }
}
