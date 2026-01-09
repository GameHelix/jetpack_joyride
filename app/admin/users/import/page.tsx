'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'

type ImportResult = {
  success: boolean
  message: string
  imported?: number
  failed?: number
  errors?: Array<{
    row: number
    email: string
    error: string
  }>
}

export default function BulkUserImportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  if (status === 'loading') {
    return (
      <DashboardLayout role={'ADMIN'}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session?.user) {
    router.push('/auth/signin')
    return null
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR') {
    router.push('/unauthorized')
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ]

      if (!validTypes.includes(selectedFile.type) &&
          !selectedFile.name.endsWith('.xlsx') &&
          !selectedFile.name.endsWith('.xls') &&
          !selectedFile.name.endsWith('.csv')) {
        alert('Please select a valid Excel (.xlsx, .xls) or CSV file')
        return
      }

      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first')
      return
    }

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/users/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to upload file. Please try again.',
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <DashboardLayout role={session.user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bulk User Import
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Import multiple users from an Excel or CSV file
            </p>
          </div>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Users
          </Link>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
                Instructions
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    Download the template file below and fill it with user data
                  </li>
                  <li>
                    Required columns: <strong>name</strong>, <strong>email</strong>, <strong>role</strong>
                  </li>
                  <li>
                    Valid roles: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">ADMIN</code>,
                    <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded ml-1">MODERATOR</code>,
                    <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded ml-1">INSTRUCTOR</code>,
                    <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded ml-1">STUDENT</code>
                  </li>
                  <li>
                    <strong>Passwords are automatically generated</strong> - secure random passwords will be created for each user
                  </li>
                  <li>
                    <strong>Welcome emails are sent automatically</strong> - each user will receive their login credentials via email
                  </li>
                  <li>
                    Duplicate emails will be skipped and reported in the results
                  </li>
                  <li>
                    Upload the completed file (supports .xlsx, .xls, or .csv formats)
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
                Secure Password Management
              </h3>
              <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                For security reasons, you do not need to provide passwords in the Excel file.
                The system will automatically generate secure, random passwords for each user and
                send them via email. Users will be prompted to change their password on first login.
              </p>
            </div>
          </div>
        </div>

        {/* Template Download */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Download Template
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Download this template file, fill it with user data (name, email, role), and upload it below.
          </p>
          <a
            href="/templates/bulk-user-import-template.xlsx"
            download="bulk-user-import-template.xlsx"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Template (Excel)
          </a>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Excel file with example data and proper formatting
          </p>
        </div>

        {/* File Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upload File
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Excel or CSV file
              </label>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
              />
            </div>

            {file && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selected file: <span className="font-medium text-gray-900 dark:text-white">{file.name}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Size: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full px-4 py-3 rounded-lg transition font-medium ${
                !file || uploading
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </span>
              ) : (
                'Upload and Import Users'
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className={`rounded-lg shadow p-6 ${
            result.success
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {result.success ? (
                  <svg className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-lg font-medium ${
                  result.success
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {result.success ? 'Import Successful' : 'Import Failed'}
                </h3>
                <div className={`mt-2 text-sm ${
                  result.success
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  <p>{result.message}</p>

                  {result.imported !== undefined && result.failed !== undefined && (
                    <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700">
                      <p className="font-medium">Import Summary:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Successfully imported: {result.imported} users</li>
                        <li>Failed: {result.failed} users</li>
                      </ul>
                    </div>
                  )}

                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium mb-2">Errors:</p>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {result.errors.map((error, index) => (
                          <div key={index} className="p-2 bg-white dark:bg-gray-800 rounded text-xs">
                            <p>
                              <strong>Row {error.row}:</strong> {error.email}
                            </p>
                            <p className="text-red-600 dark:text-red-400 mt-1">{error.error}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {result.success && result.imported && result.imported > 0 && (
                  <div className="mt-4">
                    <Link
                      href="/admin/users"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      View All Users
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
