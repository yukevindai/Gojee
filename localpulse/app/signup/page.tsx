import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join LocalPulse and start exploring</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <p className="text-center text-gray-500">Sign up form coming soon...</p>

          <Link
            href="/"
            className="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-center hover:shadow-lg transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
