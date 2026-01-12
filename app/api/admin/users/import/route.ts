import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import * as XLSX from 'xlsx'
import { auditLog } from '@/lib/audit'
import { generatePassword } from '@/lib/password'
import { sendWelcomeEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

type UserRow = {
  name: string
  email: string
  role: 'ADMIN' | 'MODERATOR' | 'INSTRUCTOR' | 'STUDENT'
}

type ImportError = {
  row: number
  email: string
  error: string
}

// POST /api/admin/users/import - Bulk import users from Excel/CSV file
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can import users
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only admins can import users' },
        { status: 403 }
      )
    }

    // Parse the uploaded file
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse Excel/CSV file
    let workbook: XLSX.WorkBook
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' })
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Failed to parse file. Please ensure it is a valid Excel or CSV file.' },
        { status: 400 }
      )
    }

    // Get the first sheet
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]

    // Convert to JSON
    const data: any[] = XLSX.utils.sheet_to_json(sheet)

    if (data.length === 0) {
      return NextResponse.json(
        { success: false, message: 'The file is empty or has no valid data' },
        { status: 400 }
      )
    }

    // Validate and process users
    const validUsers: UserRow[] = []
    const errors: ImportError[] = []
    const validRoles = ['ADMIN', 'MODERATOR', 'INSTRUCTOR', 'STUDENT']

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const rowNumber = i + 2 // +2 because Excel rows start at 1 and we have a header

      // Validate required fields
      if (!row.name || !row.email || !row.role) {
        errors.push({
          row: rowNumber,
          email: row.email || 'Unknown',
          error: 'Missing required fields (name, email, or role)',
        })
        continue
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(row.email)) {
        errors.push({
          row: rowNumber,
          email: row.email,
          error: 'Invalid email format',
        })
        continue
      }

      // Validate role
      const roleUpper = row.role.toString().toUpperCase()
      if (!validRoles.includes(roleUpper)) {
        errors.push({
          row: rowNumber,
          email: row.email,
          error: `Invalid role "${row.role}". Must be one of: ${validRoles.join(', ')}`,
        })
        continue
      }

      validUsers.push({
        name: row.name.toString().trim(),
        email: row.email.toString().trim().toLowerCase(),
        role: roleUpper as any,
      })
    }

    // Check for duplicate emails in the file
    const emailCounts = new Map<string, number>()
    validUsers.forEach((user, index) => {
      const count = emailCounts.get(user.email) || 0
      emailCounts.set(user.email, count + 1)

      if (count > 0) {
        errors.push({
          row: index + 2,
          email: user.email,
          error: 'Duplicate email in file',
        })
      }
    })

    // Remove duplicates from valid users
    const uniqueValidUsers = validUsers.filter(
      (user, index) => emailCounts.get(user.email) === 1 || validUsers.findIndex(u => u.email === user.email) === index
    )

    // Import valid users
    let imported = 0
    let emailsSent = 0
    const importErrors: ImportError[] = []

    // Helper to add delay between emails (rate limiting)
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    for (let i = 0; i < uniqueValidUsers.length; i++) {
      const userData = uniqueValidUsers[i]
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email },
        })

        if (existingUser) {
          importErrors.push({
            row: validUsers.findIndex(u => u.email === userData.email) + 2,
            email: userData.email,
            error: 'Email already exists in database',
          })
          continue
        }

        // Generate random password
        const generatedPassword = generatePassword(12)

        // Hash password
        const hashedPassword = await bcrypt.hash(generatedPassword, 10)

        // Create user
        await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            hashedPassword,
            role: userData.role,
          },
        })

        // Send welcome email with credentials
        try {
          console.log(`📧 Attempting to send welcome email to: ${userData.email}`)
          console.log(`   FROM: ${process.env.RESEND_FROM_EMAIL}`)
          console.log(`   API Key present: ${process.env.RESEND_API_KEY ? 'Yes' : 'No'}`)

          const result = await sendWelcomeEmail({
            to: userData.email,
            userName: userData.name,
            temporaryPassword: generatedPassword,
            role: userData.role,
          })

          console.log(`✅ Welcome email sent successfully to: ${userData.email}`)
          console.log(`   Email ID: ${result?.id || 'unknown'}`)
          emailsSent++

          // Rate limiting: Wait 600ms between emails (< 2 emails/sec limit)
          if (i < uniqueValidUsers.length - 1) {
            await delay(600)
          }
        } catch (emailError: any) {
          console.error(`❌ Failed to send welcome email to ${userData.email}`)
          console.error(`   Error type: ${emailError?.name || 'Unknown'}`)
          console.error(`   Error message: ${emailError?.message || 'No message'}`)
          console.error(`   Full error:`, JSON.stringify(emailError, null, 2))
          // Don't fail the import if email fails, just log it
        }

        imported++
      } catch (error) {
        console.error('Error importing user:', error)
        importErrors.push({
          row: validUsers.findIndex(u => u.email === userData.email) + 2,
          email: userData.email,
          error: 'Failed to create user in database',
        })
      }
    }

    // Combine all errors
    const allErrors = [...errors, ...importErrors]
    const failed = allErrors.length

    // Create audit log
    await auditLog.userCreated(user.id, 'BULK_IMPORT', {
      imported,
      failed,
      totalRows: data.length,
    })

    // Return results
    if (imported === 0 && failed > 0) {
      // Check if all errors are due to existing users
      const allExistingUsers = allErrors.every(e => e.error.includes('already exists'))

      return NextResponse.json({
        success: false,
        message: allExistingUsers
          ? `All ${failed} users already exist in the database. No new users were imported.`
          : `Import failed. All ${failed} users had errors.`,
        imported: 0,
        failed,
        emailsSent: 0,
        errors: allErrors,
        allExistingUsers,
      })
    }

    const emailMessage = emailsSent === imported
      ? 'Welcome emails sent to all users.'
      : emailsSent > 0
        ? `Welcome emails sent to ${emailsSent} of ${imported} users.`
        : 'Note: Email sending failed for all users. Passwords were generated but not sent.'

    return NextResponse.json({
      success: true,
      message: imported === uniqueValidUsers.length
        ? `Successfully imported all ${imported} users. ${emailMessage}`
        : `Imported ${imported} users with ${failed} errors. ${emailMessage}`,
      imported,
      failed,
      emailsSent,
      errors: allErrors.length > 0 ? allErrors : undefined,
    })
  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process bulk import' },
      { status: 500 }
    )
  }
}
