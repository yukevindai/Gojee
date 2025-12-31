'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { CUISINES, DIETARY_PREFERENCES, type UserPreferences } from '@/lib/cuisines';
import { saveUserPreferences, setOnboardingComplete } from '@/lib/userPreferences';

interface PreferencesOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreferencesOnboarding({ isOpen, onClose }: PreferencesOnboardingProps) {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [step, setStep] = useState<'cuisines' | 'dietary'>('cuisines');

  const handleToggleCuisine = (cuisineId: string) => {
    if (selectedCuisines.includes(cuisineId)) {
      setSelectedCuisines(selectedCuisines.filter(id => id !== cuisineId));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisineId]);
    }
  };

  const handleToggleDietary = (dietaryId: string) => {
    if (selectedDietary.includes(dietaryId)) {
      setSelectedDietary(selectedDietary.filter(id => id !== dietaryId));
    } else {
      setSelectedDietary([...selectedDietary, dietaryId]);
    }
  };

  const handleSkip = () => {
    setOnboardingComplete();
    onClose();
  };

  const handleContinue = () => {
    if (step === 'cuisines') {
      setStep('dietary');
    } else {
      // Save preferences
      const preferences: UserPreferences = {
        cuisines: selectedCuisines,
        dietary: selectedDietary,
      };
      saveUserPreferences(preferences);
      setOnboardingComplete();
      onClose();
    }
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
            onClick={handleSkip}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border-2 border-gray-200 bg-white p-8 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={handleSkip}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            {step === 'cuisines' ? (
              <>
                {/* Header */}
                <div className="mb-6 text-center">
                  <div className="mb-2 flex justify-center">
                    <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-3">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Want better recommendations?</h2>
                  <p className="mt-2 text-gray-600">Pick a few cuisines you like (3-8 recommended)</p>
                </div>

                {/* Cuisine Grid */}
                <div className="mb-6 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-3">
                    {CUISINES.map((cuisine) => {
                      const isSelected = selectedCuisines.includes(cuisine.id);
                      return (
                        <button
                          key={cuisine.id}
                          onClick={() => handleToggleCuisine(cuisine.id)}
                          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-3xl">{cuisine.emoji}</span>
                          <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                            {cuisine.name}
                          </span>
                          {isSelected && (
                            <span className="text-xs text-blue-500">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Counter */}
                <div className="mb-6 text-center text-sm text-gray-600">
                  {selectedCuisines.length} cuisine{selectedCuisines.length !== 1 ? 's' : ''} selected
                  {selectedCuisines.length >= 3 && selectedCuisines.length <= 8 && (
                    <span className="ml-2 text-green-600">✓ Great choice!</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSkip}
                    className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleContinue}
                    disabled={selectedCuisines.length === 0}
                    className={`flex-1 rounded-xl px-6 py-3 font-semibold text-white transition-all ${
                      selectedCuisines.length > 0
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg'
                        : 'cursor-not-allowed bg-gray-300'
                    }`}
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Header */}
                <div className="mb-6 text-center">
                  <div className="mb-2 flex justify-center">
                    <div className="rounded-full bg-gradient-to-r from-green-500 to-blue-500 p-3">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Any dietary preferences?</h2>
                  <p className="mt-2 text-gray-600">Optional - helps us find the right spots for you</p>
                </div>

                {/* Dietary Grid */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    {DIETARY_PREFERENCES.map((dietary) => {
                      const isSelected = selectedDietary.includes(dietary.id);
                      return (
                        <button
                          key={dietary.id}
                          onClick={() => handleToggleDietary(dietary.id)}
                          className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                            isSelected
                              ? 'border-green-500 bg-green-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-2xl">{dietary.emoji}</span>
                          <span className={`flex-1 text-left font-medium ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>
                            {dietary.name}
                          </span>
                          {isSelected && (
                            <span className="text-green-500">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      saveUserPreferences({ cuisines: selectedCuisines, dietary: [] });
                      setOnboardingComplete();
                      onClose();
                    }}
                    className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleContinue}
                    className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 px-6 py-3 font-semibold text-white hover:shadow-lg"
                  >
                    Save Preferences
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
