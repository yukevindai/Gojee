import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import PhoneMockup from '@/components/PhoneMockup';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-2xl font-bold text-gray-900">
            GrassMaxxing
          </div>
          <LanguageSelector />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left Column - Hero Content */}
          <div className="flex flex-col space-y-8">
            {/* Hero Text */}
            <div className="space-y-6">
              <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                Touching grass
                <br />
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  made simple
                </span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-gray-600 sm:text-xl">
                Discover amazing places, connect with nature, and make the most of your outdoor experiences.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col items-start gap-4">
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-green-600 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all hover:shadow-2xl hover:scale-105"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-blue-700 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>

              <Link
                href="/signin"
                className="text-base font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Already have an account?{' '}
                <span className="text-blue-600 hover:text-blue-700">Sign in</span>
              </Link>
            </div>

            {/* Social Proof / Stats */}
            <div className="flex items-center gap-8 pt-8">
              <div className="border-l-2 border-gray-200 pl-6">
                <div className="text-3xl font-bold text-gray-900">10k+</div>
                <div className="text-sm text-gray-500">Active Users</div>
              </div>
              <div className="border-l-2 border-gray-200 pl-6">
                <div className="text-3xl font-bold text-gray-900">50k+</div>
                <div className="text-sm text-gray-500">Places Discovered</div>
              </div>
              <div className="border-l-2 border-gray-200 pl-6">
                <div className="text-3xl font-bold text-gray-900">4.9</div>
                <div className="text-sm text-gray-500">User Rating</div>
              </div>
            </div>
          </div>

          {/* Right Column - Phone Mockup */}
          <div className="flex items-center justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 space-y-12 pb-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything you need to explore
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Simple, powerful tools to help you get outside
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Smart Search',
                description: 'Find exactly what you\'re looking for with AI-powered search',
                icon: '🔍',
              },
              {
                title: 'Interactive Maps',
                description: 'Navigate with ease using detailed, real-time maps',
                icon: '🗺️',
              },
              {
                title: 'Personalized',
                description: 'Get recommendations tailored to your preferences',
                icon: '⭐',
              },
              {
                title: 'Community',
                description: 'Connect with others and share your adventures',
                icon: '👥',
              },
              {
                title: 'Real-time Info',
                description: 'Stay updated with live information about places',
                icon: '⚡',
              },
              {
                title: 'Save & Plan',
                description: 'Organize your favorite spots and plan trips',
                icon: '📍',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-xl"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
