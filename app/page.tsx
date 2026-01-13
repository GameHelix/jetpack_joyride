import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Educy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Modern Course Management Platform
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Educy
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
                A comprehensive course management system designed for educational institutions.
                Manage courses, track assignments, and engage with AI-powered features.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 py-8">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Course Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create and manage courses, sections, and lessons with ease
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">AI-Powered</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get AI tutoring, grading assistance, and concept explanations
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track progress, submissions, and performance metrics
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="/auth/signin"
                className="block w-full md:w-auto md:inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-medium text-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              >
                Sign In to Your Account
              </Link>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Demo Accounts for Testing:
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white">Admin</p>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">admin@educy.com</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white">Instructor</p>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">alice.instructor@educy.com</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white">Student</p>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">bob.student@educy.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Built with Next.js, TypeScript, and Tailwind CSS
        </p>
      </div>
    </div>
  )
}
