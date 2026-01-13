import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5C2482] to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">
            Educy
          </h1>
          <p className="text-2xl text-purple-100">
            Modern Course Management Platform
          </p>
        </div>

        {/* Main Content Card */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-12">
          <div className="text-center space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-[#5C2482] mb-4">
                Welcome to Educy
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                A comprehensive course management system designed for educational institutions.
                Manage courses, track assignments, and engage with AI-powered features.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 py-8">
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-[#5C2482] mb-2">Course Management</h3>
                <p className="text-gray-600">
                  Create and manage courses, sections, and lessons with ease
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-[#5C2482] mb-2">AI-Powered</h3>
                <p className="text-gray-600">
                  Get AI tutoring, grading assistance, and concept explanations
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-[#5C2482] mb-2">Analytics</h3>
                <p className="text-gray-600">
                  Track progress, submissions, and performance metrics
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <Link
                href="/auth/signin"
                className="inline-block bg-[#F95B0E] hover:bg-[#d94f0c] text-white px-12 py-4 rounded-xl text-xl font-medium transition shadow-lg"
              >
                Sign In to Your Account
              </Link>
            </div>

            {/* Demo Accounts */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                Demo Accounts for Testing:
              </p>
              <div className="grid md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-[#5C2482]">Admin</p>
                  <p className="text-gray-600 mt-1">admin@educy.com</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-[#5C2482]">Instructor</p>
                  <p className="text-gray-600 mt-1">alice.instructor@educy.com</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-[#5C2482]">Moderator</p>
                  <p className="text-gray-600 mt-1">moderator@educy.com</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-[#5C2482]">Student</p>
                  <p className="text-gray-600 mt-1">bob.student@educy.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-12 text-center text-purple-100">
          Built with Next.js, TypeScript, and Tailwind CSS
        </p>
      </div>
    </div>
  )
}
