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
          html, body {
            width: 297mm;
            height: 210mm;
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          .certificate-page {
            width: 297mm;
            height: 210mm;
            margin: 0;
            padding: 0;
            page-break-after: avoid;
            page-break-before: avoid;
            page-break-inside: avoid;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        @page {
          size: A4 landscape;
          margin: 0;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white print:bg-white print:m-0 print:p-0">
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

        {/* Certificate - Landscape Layout */}
        <div className="py-8 px-4 print:p-0 print:m-0">
          <div className="max-w-[1400px] mx-auto certificate-page">
            <div className="bg-white shadow-2xl print:shadow-none relative overflow-hidden h-full print:h-[210mm]">
              {/* Ornate Border Frame */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Corner Ornaments */}
                <svg className="absolute top-0 left-0 w-24 h-24 text-[#5C2482]" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M0,0 L100,0 L100,20 L20,20 L20,100 L0,100 Z" opacity="0.1"/>
                  <circle cx="20" cy="20" r="15" opacity="0.2"/>
                </svg>
                <svg className="absolute top-0 right-0 w-24 h-24 text-[#F95B0E]" viewBox="0 0 100 100" fill="currentColor" transform="rotate(90)">
                  <path d="M0,0 L100,0 L100,20 L20,20 L20,100 L0,100 Z" opacity="0.1"/>
                  <circle cx="20" cy="20" r="15" opacity="0.2"/>
                </svg>
                <svg className="absolute bottom-0 left-0 w-24 h-24 text-[#F95B0E]" viewBox="0 0 100 100" fill="currentColor" transform="rotate(-90)">
                  <path d="M0,0 L100,0 L100,20 L20,20 L20,100 L0,100 Z" opacity="0.1"/>
                  <circle cx="20" cy="20" r="15" opacity="0.2"/>
                </svg>
                <svg className="absolute bottom-0 right-0 w-24 h-24 text-[#5C2482]" viewBox="0 0 100 100" fill="currentColor" transform="rotate(180)">
                  <path d="M0,0 L100,0 L100,20 L20,20 L20,100 L0,100 Z" opacity="0.1"/>
                  <circle cx="20" cy="20" r="15" opacity="0.2"/>
                </svg>

                {/* Double Border */}
                <div className="absolute inset-6 border-4 border-[#5C2482] rounded-sm opacity-20"></div>
                <div className="absolute inset-8 border-2 border-[#F95B0E] rounded-sm opacity-15"></div>
              </div>

              {/* Main Content - Landscape Layout */}
              <div className="relative h-full flex flex-col justify-center px-20 py-10">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-6">
                  {/* Left: Logo & Badge */}
                  <div className="flex flex-col items-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-5xl">🎓</div>
                      <div>
                        <div className="text-2xl font-bold text-[#5C2482]">Educy</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Learning Platform</div>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-md">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white font-bold text-xs tracking-wider">VERIFIED</span>
                    </div>
                  </div>

                  {/* Center: Title */}
                  <div className="text-center flex-1 px-8">
                    <div className="inline-block">
                      <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#5C2482] via-purple-600 to-[#F95B0E] mb-1">
                        Certificate of Achievement
                      </h1>
                      <div className="h-1 bg-gradient-to-r from-[#5C2482] via-purple-400 to-[#F95B0E] rounded-full"></div>
                    </div>
                  </div>

                  {/* Right: Date & ID */}
                  <div className="text-right text-xs">
                    <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                      <div className="text-gray-500 uppercase tracking-wider mb-1">Issued</div>
                      <div className="font-semibold text-gray-700">{format(new Date(certificate.issuedAt), 'MMM d, yyyy')}</div>
                      <div className="text-gray-400 text-[10px] mt-2 font-mono">ID: {certificate.certificateNumber.substring(0, 8)}</div>
                    </div>
                  </div>
                </div>

                {/* Main Certificate Content - Two Column Layout */}
                <div className="grid grid-cols-5 gap-8 flex-1">
                  {/* Left Column - Student & Course Info (60%) */}
                  <div className="col-span-3 flex flex-col justify-center space-y-5">
                    {/* Certifies Statement */}
                    <div>
                      <p className="text-base text-gray-600 mb-2">This is to certify that</p>
                      <h2 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#5C2482] to-[#7B3FA3] mb-1">
                        {certificate.studentName}
                      </h2>
                      <p className="text-base text-gray-600">has successfully completed</p>
                    </div>

                    {/* Course Information Box */}
                    <div className="bg-gradient-to-br from-purple-50 via-white to-orange-50 border-l-4 border-[#5C2482] p-5 rounded-r-lg shadow-md">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-2xl font-bold text-[#5C2482]">{certificate.courseCode}</span>
                        <span className="text-lg font-semibold text-gray-800">{certificate.courseTitle}</span>
                      </div>
                      {certificate.courseDescription && (
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                          {certificate.courseDescription}
                        </p>
                      )}
                    </div>

                    {/* Achievement Statement */}
                    <p className="text-sm text-gray-600 italic">
                      demonstrating excellence, dedication, and successful mastery of the course curriculum
                    </p>
                  </div>

                  {/* Right Column - Details & Signature (40%) */}
                  <div className="col-span-2 flex flex-col justify-center space-y-6">
                    {/* Details Grid */}
                    <div className="space-y-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Completion Date</div>
                        <div className="text-base font-bold text-[#5C2482]">
                          {format(new Date(certificate.completionDate), 'MMMM d, yyyy')}
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Instructor</div>
                        <div className="text-base font-bold text-[#5C2482]">{certificate.instructorName}</div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Authorized By</div>
                        <div className="text-base font-bold text-[#5C2482]">
                          {certificate.issuedByName || 'Educy Administration'}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {certificate.issuedByRole || 'System'}
                        </div>
                      </div>
                    </div>

                    {/* Signature */}
                    <div className="pt-4 border-t-2 border-gray-300">
                      <div className="text-center">
                        <div className="w-32 h-px bg-gray-400 mx-auto mb-1"></div>
                        <p className="text-xs font-semibold text-gray-700">Official Signature</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <div>
                    <span className="font-semibold">Certificate ID:</span>
                    <span className="ml-2 font-mono text-[10px]">{certificate.certificateNumber}</span>
                  </div>
                  <div className="text-right">
                    <span>Verify at: </span>
                    <span className="font-mono">educy.vercel.app/verify/{certificate.certificateNumber.substring(0, 8)}</span>
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
