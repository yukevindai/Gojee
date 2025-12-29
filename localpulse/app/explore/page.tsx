'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FilterDropdown from '@/components/FilterDropdown';
import Link from 'next/link';

export default function ExplorePage() {
  const [partySize, setPartySize] = useState('');
  const [dining, setDining] = useState<string[]>([]);
  const [hangout, setHangout] = useState('');

  const partySizeOptions = ['2', '3', '4', '5', '6', '7', '8', '9+'];
  const diningOptions = ['Breakfast', 'Lunch', 'Dinner', 'Quick Bite', 'Snack', 'Desert'];
  const hangoutOptions = ['Formal', 'Chill', 'Date', 'N/A'];

  const shortcuts = [
    {
      label: 'Group Dinner',
      icon: '👥',
      preset: {
        partySize: '6',
        dining: ['Dinner'],
        hangout: 'Formal',
      },
    },
    {
      label: 'Quick Lunch',
      icon: '⚡',
      preset: {
        partySize: '2',
        dining: ['Quick Bite', 'Lunch'],
        hangout: 'Chill',
      },
    },
    {
      label: 'Date Night',
      icon: '💕',
      preset: {
        partySize: '2',
        dining: ['Dinner'],
        hangout: 'Date',
      },
    },
  ];

  const applyPreset = (preset: { partySize: string; dining: string[]; hangout: string }) => {
    setPartySize(preset.partySize);
    setDining(preset.dining);
    setHangout(preset.hangout);
  };

  const hasAnySelection = partySize !== '' || dining.length > 0 || hangout !== '';

  const handleConfirm = () => {
    if (hasAnySelection) {
      console.log('Confirm clicked:', { partySize, dining, hangout });
      // TODO: Navigate to results or trigger search
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map Background - TODO: Replace with Google Maps */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-green-50 to-yellow-50">
        {/* Mock Map Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-gray-300" />
            ))}
          </div>
        </div>

        {/* Mock User Location Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="relative"
          >
            <div className="w-16 h-16 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center border-4 border-white">
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
            {/* Pulse Effect */}
            <motion.div
              animate={{
                scale: [1, 2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute inset-0 bg-blue-400 rounded-full"
            />
          </motion.div>
        </div>

        {/* Mock Location Markers */}
        {[
          { x: '25%', y: '30%' },
          { x: '60%', y: '40%' },
          { x: '40%', y: '65%' },
          { x: '70%', y: '25%' },
          { x: '30%', y: '70%' },
        ].map((pos, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.2 }}
            className="absolute w-10 h-10 bg-purple-600 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform"
            style={{ left: pos.x, top: pos.y }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
              📍
            </div>
          </motion.div>
        ))}

        {/* Map Instructions Overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
          <p className="text-xs text-gray-600 font-medium">
            🗺️ Map centered on your location
          </p>
        </div>
      </div>

      {/* Top Filters Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-medium text-sm">Back</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">LocalPulse</h1>
            <div className="w-16" /> {/* Spacer for centering */}
          </div>

          <div className="flex flex-wrap gap-3">
            <FilterDropdown
              label="Party Size"
              options={partySizeOptions}
              value={partySize}
              onChange={(val) => setPartySize(val as string)}
            />
            <FilterDropdown
              label="Dining"
              options={diningOptions}
              value={dining}
              onChange={(val) => setDining(val as string[])}
              multiSelect
            />
            <FilterDropdown
              label="Hangout"
              options={hangoutOptions}
              value={hangout}
              onChange={(val) => setHangout(val as string)}
            />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Shortcut Buttons */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {shortcuts.map((shortcut) => (
              <button
                key={shortcut.label}
                onClick={() => applyPreset(shortcut.preset)}
                className="flex-shrink-0 px-5 py-3 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-purple-300 flex items-center gap-2"
              >
                <span className="text-2xl">{shortcut.icon}</span>
                <span className="font-semibold text-sm text-gray-900 whitespace-nowrap">
                  {shortcut.label}
                </span>
              </button>
            ))}
          </div>

          {/* Confirm Button */}
          <motion.button
            onClick={handleConfirm}
            disabled={!hasAnySelection}
            className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all ${
              hasAnySelection
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:shadow-2xl transform hover:scale-[1.02]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            animate={
              hasAnySelection
                ? {
                    boxShadow: [
                      '0 10px 40px rgba(147, 51, 234, 0.3)',
                      '0 10px 60px rgba(147, 51, 234, 0.6)',
                      '0 10px 40px rgba(147, 51, 234, 0.3)',
                    ],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            {hasAnySelection ? (
              <span className="flex items-center justify-center gap-2">
                ✨ Confirm & GrassMax
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  🌱
                </motion.span>
              </span>
            ) : (
              'Select filters to continue'
            )}
          </motion.button>

          {/* Selection Summary */}
          {hasAnySelection && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-50 rounded-xl p-3 text-center"
            >
              <p className="text-sm text-purple-800 font-medium">
                {partySize && `Party of ${partySize}`}
                {partySize && (dining.length > 0 || hangout) && ' • '}
                {dining.length > 0 && `${dining.join(', ')}`}
                {dining.length > 0 && hangout && ' • '}
                {hangout && hangout}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
