'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plan } from '@/lib/types';
import Link from 'next/link';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const planData = searchParams.get('plan');
    if (planData) {
      try {
        const parsedPlan = JSON.parse(decodeURIComponent(planData));
        setPlan(parsedPlan);
      } catch (err) {
        setError('Failed to load plan data');
      }
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-6xl mb-4"
          >
            🌱
          </motion.div>
          <p className="text-xl font-semibold text-gray-700">Finding your perfect plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h2>
          <p className="text-gray-600 mb-6">
            {error || 'No plan found. Please try searching again.'}
          </p>
          <Link
            href="/explore"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const { diningSpot, activity, totalDistance } = plan;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/explore"
            className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium text-sm">Back</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Your GrassMax Plan</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        {/* Success Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl p-6 text-white text-center shadow-xl"
        >
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold mb-2">Perfect Plan Found!</h2>
          <p className="text-green-50">
            {totalDistance.toFixed(1)}km total • {plan.filters.partySize && `Party of ${plan.filters.partySize}`}
          </p>
        </motion.div>

        {/* Dining Spot */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-purple-100">Step 1 • Dining</p>
                <h3 className="text-xl font-bold">{diningSpot.name}</h3>
              </div>
            </div>
          </div>

          {diningSpot.photos && diningSpot.photos.length > 0 && (
            <div className="h-48 overflow-hidden">
              <img
                src={diningSpot.photos[0]}
                alt={diningSpot.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500 text-lg">⭐</span>
                <span className="font-bold text-gray-900">{diningSpot.rating}</span>
                <span className="text-sm text-gray-500">({diningSpot.userRatingsTotal} reviews)</span>
              </div>
              {diningSpot.priceLevel && (
                <div className="text-green-600 font-medium">
                  {'$'.repeat(diningSpot.priceLevel)}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 text-gray-600">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{diningSpot.address}</span>
            </div>

            {diningSpot.reviews && diningSpot.reviews.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-700 italic">"{diningSpot.reviews[0].text}"</p>
                <div className="flex items-center gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < diningSpot.reviews![0].rating ? 'text-yellow-500' : 'text-gray-300'}>
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors">
              View on Google Maps
            </button>
          </div>
        </motion.div>

        {/* Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-blue-100">Step 2 • Activity</p>
                <h3 className="text-xl font-bold">{activity.name}</h3>
              </div>
            </div>
          </div>

          {activity.photos && activity.photos.length > 0 && (
            <div className="h-48 overflow-hidden">
              <img
                src={activity.photos[0]}
                alt={activity.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500 text-lg">⭐</span>
                <span className="font-bold text-gray-900">{activity.rating}</span>
                <span className="text-sm text-gray-500">({activity.userRatingsTotal} reviews)</span>
              </div>
              {activity.priceLevel && (
                <div className="text-green-600 font-medium">
                  {'$'.repeat(activity.priceLevel)}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 text-gray-600">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{activity.address}</span>
            </div>

            {activity.reviews && activity.reviews.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-700 italic">"{activity.reviews[0].text}"</p>
                <div className="flex items-center gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < activity.reviews![0].rating ? 'text-yellow-500' : 'text-gray-300'}>
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              View on Google Maps
            </button>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="flex-1 py-4 bg-white border-2 border-purple-600 text-purple-600 rounded-2xl font-semibold hover:bg-purple-50 transition-colors">
            Save Plan
          </button>
          <button className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all">
            Share with Friends
          </button>
        </div>
      </div>
    </div>
  );
}
