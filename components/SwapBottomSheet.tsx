'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  MapPin,
  TrendingUp,
  TrendingDown,
  Navigation,
  DollarSign,
  Check,
  Zap,
  Clock
} from 'lucide-react';
import type { Place } from '@/lib/places';

interface Alternative {
  place: Place;
  distanceImpact: string; // e.g., "+3 min", "-5 min"
  reason: string; // e.g., "Higher rated", "Closer to next stop"
}

interface SwapBottomSheetProps {
  isOpen: boolean;
  type: 'restaurant' | 'activity';
  alternatives: Alternative[];
  currentPlace: Place;
  onSelect: (place: Place) => void;
  onConfirm: () => void;
  onCancel: () => void;
  selectedPreview: Place | null;
}

export default function SwapBottomSheet({
  isOpen,
  type,
  alternatives,
  currentPlace,
  onSelect,
  onConfirm,
  onCancel,
  selectedPreview,
}: SwapBottomSheetProps) {
  const [localSelection, setLocalSelection] = useState<Place | null>(null);

  useEffect(() => {
    if (selectedPreview) {
      setLocalSelection(selectedPreview);
    }
  }, [selectedPreview]);

  const handleSelect = (place: Place) => {
    setLocalSelection(place);
    onSelect(place);
  };

  const getPriceSymbol = (level?: number) => {
    if (!level) return '$$';
    return '$'.repeat(level);
  };

  const getDistanceIcon = (impact: string) => {
    if (impact.startsWith('+')) {
      return <TrendingUp className="h-3 w-3 text-orange-500" />;
    }
    if (impact.startsWith('-')) {
      return <TrendingDown className="h-3 w-3 text-green-500" />;
    }
    return <Navigation className="h-3 w-3 text-gray-400" />;
  };

  const getReasonIcon = (reason: string) => {
    if (reason.toLowerCase().includes('rated')) {
      return <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />;
    }
    if (reason.toLowerCase().includes('closer')) {
      return <Navigation className="h-3 w-3 text-blue-500" />;
    }
    return <Zap className="h-3 w-3 text-purple-500" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-hidden rounded-t-3xl border-t-2 border-gray-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Swap {type === 'restaurant' ? 'Restaurant' : 'Activity'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Showing nearby options that match your plan
                  </p>
                </div>
                <button
                  onClick={onCancel}
                  className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Preview Banner */}
              {localSelection && localSelection.id !== currentPlace.id && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-900"
                >
                  <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  Previewing this change
                </motion.div>
              )}
            </div>

            {/* Alternatives List */}
            <div className="max-h-[50vh] overflow-y-auto p-6">
              <div className="space-y-3">
                {/* Current Option */}
                <div className="rounded-xl border-2 border-gray-300 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="rounded-full bg-gray-600 px-2 py-0.5 text-xs font-medium text-white">
                      Current
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{currentPlace.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        {currentPlace.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{currentPlace.rating.toFixed(1)}</span>
                            {currentPlace.userRatingsTotal && (
                              <span className="text-gray-500">
                                ({currentPlace.userRatingsTotal.toLocaleString()})
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{getPriceSymbol(currentPlace.priceLevel)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alternative Options */}
                {alternatives.map((alt, idx) => {
                  const isSelected = localSelection?.id === alt.place.id;
                  const isCurrentlyUsed = alt.place.id === currentPlace.id;

                  return (
                    <button
                      key={alt.place.id}
                      onClick={() => handleSelect(alt.place)}
                      disabled={isCurrentlyUsed}
                      className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : isCurrentlyUsed
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="mb-1 flex items-start justify-between gap-2">
                            <h4 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                              {alt.place.name}
                            </h4>
                            {isSelected && (
                              <div className="rounded-full bg-blue-500 p-1">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Rating & Price */}
                          <div className="mb-2 flex items-center gap-3 text-xs text-gray-600">
                            {alt.place.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{alt.place.rating.toFixed(1)}</span>
                                {alt.place.userRatingsTotal && (
                                  <span className="text-gray-500">
                                    ({alt.place.userRatingsTotal.toLocaleString()})
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>{getPriceSymbol(alt.place.priceLevel)}</span>
                            </div>
                          </div>

                          {/* Highlights */}
                          <div className="flex flex-wrap gap-2">
                            {/* Distance Impact */}
                            <div
                              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                                alt.distanceImpact.startsWith('+')
                                  ? 'bg-orange-100 text-orange-700'
                                  : alt.distanceImpact.startsWith('-')
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {getDistanceIcon(alt.distanceImpact)}
                              <span>{alt.distanceImpact}</span>
                            </div>

                            {/* Reason */}
                            <div className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                              {getReasonIcon(alt.reason)}
                              <span>{alt.reason}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={!localSelection || localSelection.id === currentPlace.id}
                  className={`flex-1 rounded-xl px-6 py-3 font-semibold transition-all ${
                    localSelection && localSelection.id !== currentPlace.id
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Confirm Changes
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
