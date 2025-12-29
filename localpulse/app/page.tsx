import Link from 'next/link';
import FloatingPhone from '@/components/FloatingPhone';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* Language Options - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <button className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-purple-300">
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">EN</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
          {/* Left Section - Text Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Touching grass
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  made simple.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0">
                Your personal concierge for discovering and planning amazing local experiences.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <Link
                href="/signup"
                className="inline-block w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Get Started
              </Link>
              <div className="text-center sm:text-left">
                <Link
                  href="/signin"
                  className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium"
                >
                  Already have an account?{' '}
                  <span className="underline underline-offset-2">Sign in</span>
                </Link>
              </div>
            </div>

            {/* Social Proof / Trust Indicators */}
            <div className="pt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Free to start</span>
              </div>
            </div>
          </div>

          {/* Right Section - Floating Phone */}
          <div className="flex justify-center lg:justify-end">
            <FloatingPhone />
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>
    </div>
  );
}
