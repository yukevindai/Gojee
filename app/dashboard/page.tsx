'use client';

import { useState, useEffect } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import Link from 'next/link';
import FilterDropdown from '@/components/FilterDropdown';
import QuickKeyButton from '@/components/QuickKeyButton';
import { Sparkles, Home } from 'lucide-react';

export default function Dashboard() {
  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 37.7749, // Default to San Francisco
    lng: -122.4194,
  });

  // Filter states
  const [partySize, setPartySize] = useState<string>('');
  const [dining, setDining] = useState<string[]>([]);
  const [hangout, setHangout] = useState<string>('');

  // QuickKey state
  const [selectedQuickKey, setSelectedQuickKey] = useState<string>('');

  // Success state
  const [showSuccess, setShowSuccess] = useState(false);

  // Get user's geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Check if any filter or quickkey is selected
  const hasSelection =
    partySize !== '' ||
    dining.length > 0 ||
    hangout !== '' ||
    selectedQuickKey !== '';

  const handleQuickKeyClick = (key: string) => {
    const newKey = selectedQuickKey === key ? '' : key;
    setSelectedQuickKey(newKey);

    // Apply quickkey presets
    if (newKey === 'dinner-chill') {
      setPartySize('4');
      setDining(['Dinner']);
      setHangout('Chill');
    } else if (newKey === 'quick-lunch') {
      setPartySize('2');
      setDining(['Quick bite', 'Lunch']);
      setHangout('N/A');
    } else if (newKey === 'date-night') {
      setPartySize('2');
      setDining(['Dinner']);
      setHangout('Date');
    } else {
      // Clear filters when deselecting
      setPartySize('');
      setDining([]);
      setHangout('');
    }
  };

  const handleConfirm = () => {
    if (!hasSelection) return;

    // Show success message
    setShowSuccess(true);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);

    // Log the selected filters (in production, this would trigger a search/API call)
    console.log('GrassMaxxing with filters:', {
      partySize,
      dining,
      hangout,
      selectedQuickKey,
      location: userLocation
    });
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-50">
      {/* Google Map - Full Screen */}
      <APIProvider apiKey={apiKey}>
        <Map
          defaultZoom={14}
          center={userLocation}
          mapId="grassmaxxing-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="h-full w-full"
        />
      </APIProvider>

      {/* Top Filters Overlay */}
      <div className="absolute left-0 right-0 top-0 z-10 bg-gradient-to-b from-white/95 via-white/80 to-transparent p-4 pb-8 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">GrassMaxxing</h1>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            <FilterDropdown
              label="Party Size"
              options={['2', '3', '4', '5', '6', '7', '8', '9+']}
              value={partySize}
              onChange={(val) => setPartySize(val as string)}
            />
            <FilterDropdown
              label="Dining"
              options={['Breakfast', 'Lunch', 'Dinner', 'Quick bite', 'Snack', 'Dessert']}
              value={dining}
              onChange={(val) => setDining(val as string[])}
              multiSelect
            />
            <FilterDropdown
              label="Hangout"
              options={['Formal', 'Chill', 'Date', 'N/A']}
              value={hangout}
              onChange={(val) => setHangout(val as string)}
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-white via-white to-transparent p-4 pt-8 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl space-y-4">
          {/* QuickKey Buttons */}
          <div className="flex gap-3">
            <QuickKeyButton
              label="Group dinner then chill"
              icon="🍽️"
              isSelected={selectedQuickKey === 'dinner-chill'}
              onClick={() => handleQuickKeyClick('dinner-chill')}
            />
            <QuickKeyButton
              label="Grab some quick lunch"
              icon="🥪"
              isSelected={selectedQuickKey === 'quick-lunch'}
              onClick={() => handleQuickKeyClick('quick-lunch')}
            />
            <QuickKeyButton
              label="Date night"
              icon="❤️"
              isSelected={selectedQuickKey === 'date-night'}
              onClick={() => handleQuickKeyClick('date-night')}
            />
          </div>

          {/* Confirm Button */}
          <motion.button
            onClick={handleConfirm}
            disabled={!hasSelection}
            whileTap={hasSelection ? { scale: 0.98 } : {}}
            className={clsx(
              'relative w-full overflow-hidden rounded-2xl py-4 text-lg font-bold shadow-lg transition-all',
              hasSelection
                ? 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white shadow-xl hover:shadow-2xl'
                : 'cursor-not-allowed bg-gray-200 text-gray-400'
            )}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {hasSelection && <Sparkles className="h-5 w-5" />}
              Confirm & GrassMax
              {hasSelection && <Sparkles className="h-5 w-5" />}
            </span>
            {hasSelection && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-600 via-blue-600 to-purple-700"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ opacity: 0.3 }}
              />
            )}
          </motion.button>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 px-8 py-4 shadow-2xl">
            <div className="flex items-center gap-3 text-white">
              <Sparkles className="h-6 w-6" />
              <div>
                <p className="font-bold">GrassMaxxing Activated! 🎉</p>
                <p className="text-sm opacity-90">
                  Finding the perfect spots for you...
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
