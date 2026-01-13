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
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-page {
            width: 100%;
            height: 100vh;
            page-break-after: avoid;
            margin: 0;
            padding: 0;
          }
        }
        @page {
          size: A4 landscape;
          margin: 0;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white print:bg-white">
        {/* Header - Hide on print */}
        <div className="no-print bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="text-2xl font-bold text-[#5C2482]">
                  Educy
                </Link>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">Certificate Verification</span>
              </div>
              <button
                onClick={handlePrint}
                className="px-6 py-2 bg-[#F95B0E] text-white rounded-xl hover:bg-[#d94f0c] transition font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Certificate
              </button>
            </div>
          </div>
        </div>

        {/* Certificate Container */}
        <div className="py-8 px-4 print:p-0">
          <div className="max-w-[1100px] mx-auto print-page">
            {/* Certificate Card */}
            <div className="bg-white shadow-2xl print:shadow-none relative overflow-hidden">
              {/* Decorative Border Pattern */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-[#5C2482] rounded-tl-3xl"></div>
                <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-[#F95B0E] rounded-tr-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-[#F95B0E] rounded-bl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-[#5C2482] rounded-br-3xl"></div>
              </div>

              {/* Content */}
              <div className="relative px-16 py-12">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#5C2482] to-[#5C2482]"></div>
                    <div className="text-7xl">🎓</div>
                    <div className="w-16 h-1 bg-gradient-to-l from-transparent via-[#5C2482] to-[#5C2482]"></div>
                  </div>
                  <h1 className="text-5xl font-serif font-bold text-[#5C2482] mb-2">
                    Certificate of Completion
                  </h1>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="w-20 h-0.5 bg-[#F95B0E]"></div>
                    <p className="text-lg text-gray-600 font-medium">Presented by Educy Learning Platform</p>
                    <div className="w-20 h-0.5 bg-[#F95B0E]"></div>
                  </div>
                </div>

                {/* Verified Badge */}
                <div className="flex justify-center mb-8">
                  <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white font-bold text-sm tracking-wide">VERIFIED AUTHENTIC</span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="text-center mb-8">
                  <p className="text-xl text-gray-600 mb-3">This is to certify that</p>
                  <h2 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#5C2482] to-[#7B3FA3] mb-3">
                    {certificate.studentName}
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">has successfully completed the course</p>

                  {/* Course Box */}
                  <div className="max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-orange-50 rounded-2xl p-8 border-2 border-[#5C2482] shadow-lg mb-8">
                    <div className="text-3xl font-bold text-[#5C2482] mb-2">
                      {certificate.courseCode}
                    </div>
                    <div className="text-2xl font-semibold text-gray-800 mb-3">
                      {certificate.courseTitle}
                    </div>
                    {certificate.courseDescription && (
                      <p className="text-gray-600 text-base leading-relaxed">
                        {certificate.courseDescription}
                      </p>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-8">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Completion Date
                    </div>
                    <div className="text-lg font-bold text-[#5C2482]">
                      {format(new Date(certificate.completionDate), 'MMMM d, yyyy')}
                    </div>
                  </div>
                  <div className="text-center border-x-2 border-gray-200">
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Instructor
                    </div>
                    <div className="text-lg font-bold text-[#5C2482]">
                      {certificate.instructorName}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Issued Date
                    </div>
                    <div className="text-lg font-bold text-[#5C2482]">
                      {format(new Date(certificate.issuedAt), 'MMMM d, yyyy')}
                    </div>
                  </div>
                </div>

                {/* Signature Line */}
                <div className="max-w-md mx-auto mb-8">
                  <div className="border-t-2 border-gray-300 pt-2 text-center">
                    <p className="text-sm font-semibold text-gray-700">
                      {certificate.issuedByName || 'Educy Administration'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {certificate.issuedByRole || 'System'} • Educy Learning Platform
                    </p>
                  </div>
                </div>

                {/* Certificate ID */}
                <div className="border-t-2 border-gray-200 pt-6 mt-6">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Certificate Verification ID
                    </p>
                    <p className="text-sm font-mono text-gray-600 mb-2">
                      {certificate.certificateNumber}
                    </p>
                    <p className="text-xs text-gray-400">
                      Verify online at: educy.vercel.app/verify/{certificate.certificateNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Hide on print */}
        <div className="no-print text-center py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#5C2482] hover:text-[#7B3FA3] font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Homepage
          </Link>
        </div>
      </div>
    </>
  )
}
