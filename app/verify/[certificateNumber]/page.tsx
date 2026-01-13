'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'

interface CertificateData {
  id: string
  certificateNumber: string
  studentName: string
  courseCode: string
  courseTitle: string
  courseDescription: string | null
  instructorName: string
  completionDate: string
  issuedAt: string
  issuedByName: string | null
  issuedByRole: string | null
}

export default function VerifyCertificatePage({ params }: { params: { certificateNumber: string } }) {
  const [certificate, setCertificate] = useState<CertificateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCertificate()
  }, [])

  const fetchCertificate = async () => {
    try {
      const response = await fetch(`/api/certificates/verify/${params.certificateNumber}`)
      const data = await response.json()

      if (data.success) {
        setCertificate(data.certificate)
      } else {
        setError(data.error || 'Certificate not found')
      }
    } catch (err) {
      setError('Failed to verify certificate')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C2482]"></div>
          <p className="mt-4 text-gray-600">Verifying certificate...</p>
        </div>
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Certificate Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'The certificate you are looking for does not exist or has been revoked.'}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#5C2482] text-white rounded-xl hover:bg-[#7B3FA3] transition font-medium"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12 px-4 print:bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header - Hide on print */}
        <div className="mb-8 print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#5C2482]">
                Certificate Verification
              </h1>
              <p className="text-gray-600 mt-1">
                This is an authentic certificate issued by Educy
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-[#F95B0E] text-white rounded-xl hover:bg-[#d94f0c] transition font-medium"
            >
              Print Certificate
            </button>
          </div>
        </div>

        {/* Certificate */}
        <div className="bg-white rounded-xl shadow-2xl border-4 border-[#5C2482] print:shadow-none print:border-2">
          {/* Decorative Header */}
          <div className="bg-gradient-to-r from-[#5C2482] to-[#7B3FA3] px-8 py-12 text-center text-white">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-4xl font-bold mb-2">
              Certificate of Completion
            </h2>
            <p className="text-purple-100 text-lg">
              Presented by Educy Learning Platform
            </p>
          </div>

          {/* Certificate Body */}
          <div className="p-12">
            {/* Verified Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 border-2 border-green-500 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-semibold">Verified Certificate</span>
              </div>
            </div>

            {/* Student Name */}
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg mb-2">This certifies that</p>
              <h3 className="text-4xl font-bold text-[#5C2482] mb-2">
                {certificate.studentName}
              </h3>
              <p className="text-gray-600 text-lg">has successfully completed</p>
            </div>

            {/* Course Details */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 mb-8 border border-purple-200">
              <div className="text-center">
                <h4 className="text-3xl font-bold text-[#5C2482] mb-2">
                  {certificate.courseCode}
                </h4>
                <p className="text-2xl text-gray-700 mb-4">
                  {certificate.courseTitle}
                </p>
                {certificate.courseDescription && (
                  <p className="text-gray-600">
                    {certificate.courseDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Completion Date
                </p>
                <p className="text-lg font-semibold text-gray-700">
                  {format(new Date(certificate.completionDate), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Issued Date
                </p>
                <p className="text-lg font-semibold text-gray-700">
                  {format(new Date(certificate.issuedAt), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Instructor
                </p>
                <p className="text-lg font-semibold text-gray-700">
                  {certificate.instructorName}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Issued By
                </p>
                <p className="text-lg font-semibold text-gray-700">
                  {certificate.issuedByName || 'System'}
                  {certificate.issuedByRole && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({certificate.issuedByRole})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Certificate ID */}
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Certificate ID
                </p>
                <p className="text-sm font-mono text-gray-600 mb-4">
                  {certificate.certificateNumber}
                </p>
                <p className="text-xs text-gray-500">
                  Verify this certificate at: {window.location.origin}/verify/{certificate.certificateNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              This certificate is digitally verified and issued by Educy Learning Platform
            </p>
          </div>
        </div>

        {/* Back Button - Hide on print */}
        <div className="mt-8 text-center print:hidden">
          <Link
            href="/"
            className="inline-block text-[#5C2482] hover:underline"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
