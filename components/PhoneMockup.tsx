'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Clock } from 'lucide-react';

export default function PhoneMockup() {
  const [currentView, setCurrentView] = useState<'search' | 'map'>('search');
  const [typedText, setTypedText] = useState('');
  const fullText = 'dine out with friends';

  useEffect(() => {
    // Typing animation
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        // Switch to map view after typing is complete
        setTimeout(() => {
          setCurrentView('map');
        }, 800);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="relative">
      {/* iPhone Frame */}
      <div className="relative h-[600px] w-[300px] rounded-[3rem] border-[14px] border-gray-800 bg-gray-800 shadow-2xl">
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-10 h-6 w-40 -translate-x-1/2 rounded-b-2xl bg-gray-800" />

        {/* Screen */}
        <div className="h-full w-full overflow-hidden rounded-[2.2rem] bg-white">
          <AnimatePresence mode="wait">
            {currentView === 'search' ? (
              <motion.div
                key="search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex h-full flex-col p-6"
              >
                {/* Status Bar */}
                <div className="mb-8 flex items-center justify-between text-xs font-semibold text-gray-900">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-4 rounded-sm border border-gray-900" />
                  </div>
                </div>

                {/* App Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    GrassMaxxing
                  </h2>
                  <p className="text-sm text-gray-500">Find your next adventure</p>
                </div>

                {/* Search Bar with Typing Animation */}
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <motion.input
                    value={typedText}
                    readOnly
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-gray-900 focus:outline-none"
                    placeholder="What do you want to do?"
                  />
                  <motion.div
                    className="absolute right-4 top-1/2 h-5 w-0.5 -translate-y-1/2 bg-blue-500"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </div>

                {/* Quick Suggestions */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Suggestions
                  </p>
                  {['Coffee nearby', 'Parks & trails', 'Restaurants', 'Events today'].map(
                    (suggestion, index) => (
                      <motion.div
                        key={suggestion}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                          <MapPin className="h-5 w-5 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {suggestion}
                        </span>
                      </motion.div>
                    )
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative h-full w-full"
              >
                {/* Map Background with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
                  {/* Mock Map Grid */}
                  <div className="absolute inset-0 opacity-20">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={`h-${i}`}
                        className="absolute h-px w-full bg-gray-400"
                        style={{ top: `${i * 5}%` }}
                      />
                    ))}
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={`v-${i}`}
                        className="absolute h-full w-px bg-gray-400"
                        style={{ left: `${i * 5}%` }}
                      />
                    ))}
                  </div>

                  {/* Animated Map Pins */}
                  {[
                    { top: '30%', left: '40%', delay: 0 },
                    { top: '50%', left: '60%', delay: 0.1 },
                    { top: '45%', left: '25%', delay: 0.2 },
                    { top: '65%', left: '50%', delay: 0.3 },
                    { top: '35%', left: '70%', delay: 0.4 },
                  ].map((pin, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: pin.delay, type: 'spring' }}
                      className="absolute"
                      style={{ top: pin.top, left: pin.left }}
                    >
                      <div className="relative">
                        <MapPin className="h-8 w-8 fill-red-500 text-red-600" />
                        <motion.div
                          className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-red-500"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: pin.delay }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Search Bar Overlay */}
                <div className="absolute left-4 right-4 top-4">
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg"
                  >
                    <Search className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-900">dine out with friends</span>
                  </motion.div>
                </div>

                {/* Location Cards */}
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                  {[
                    { name: 'The Garden Bistro', rating: 4.8, time: '15 min' },
                    { name: 'Riverside Cafe', rating: 4.6, time: '22 min' },
                  ].map((place, index) => (
                    <motion.div
                      key={place.name}
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="rounded-2xl bg-white p-4 shadow-xl"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{place.name}</h3>
                          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{place.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{place.time}</span>
                            </div>
                          </div>
                        </div>
                        <button className="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white">
                          View
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-gray-700" />
      </div>
    </div>
  );
}
