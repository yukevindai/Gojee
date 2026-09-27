'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function FloatingPhone() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="relative w-[280px] h-[560px]"
      animate={{
        y: [0, -20, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Phone Frame */}
      <div className="absolute inset-0 bg-black rounded-[40px] shadow-2xl border-8 border-gray-800">
        {/* Screen */}
        <div className="w-full h-full bg-white rounded-[32px] overflow-hidden p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm font-semibold text-gray-900">LocalPulse</div>
            <div className="w-8 h-8 bg-purple-100 rounded-full" />
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Step 0: Typing Animation */}
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    What are you looking for?
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value=""
                      readOnly
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-white"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: 'auto' }}
                      transition={{ duration: 2 }}
                      className="absolute left-4 top-3 text-sm text-gray-900 overflow-hidden whitespace-nowrap"
                    >
                      date night
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-[2px] h-4 bg-purple-600 ml-1"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Colorful Confirm Button */}
              {step === 1 && (
                <motion.div
                  key="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-4"
                >
                  <div className="text-center space-y-2">
                    <div className="text-lg font-bold text-gray-900">Found 12 options</div>
                    <div className="text-sm text-gray-600">near Downtown</div>
                  </div>
                  <motion.button
                    initial={{ background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)' }}
                    animate={{
                      background: [
                        'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="w-full py-4 rounded-xl text-white font-semibold text-sm shadow-lg"
                  >
                    Confirm Selection
                  </motion.button>
                </motion.div>
              )}

              {/* Step 2: Map Appearing */}
              {step === 2 && (
                <motion.div
                  key="map"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="space-y-3"
                >
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 via-green-50 to-yellow-50 rounded-2xl relative overflow-hidden">
                    {/* Map Grid Lines */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      transition={{ delay: 0.2 }}
                      className="absolute inset-0"
                    >
                      <div className="grid grid-cols-4 grid-rows-4 h-full">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className="border border-gray-300" />
                        ))}
                      </div>
                    </motion.div>

                    {/* Location Pins */}
                    {[
                      { x: '30%', y: '40%', delay: 0.3 },
                      { x: '60%', y: '30%', delay: 0.5 },
                      { x: '50%', y: '60%', delay: 0.7 },
                    ].map((pin, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: pin.delay, type: 'spring' }}
                        className="absolute w-6 h-6 bg-purple-600 rounded-full shadow-lg flex items-center justify-center"
                        style={{ left: pin.x, top: pin.y }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </motion.div>
                    ))}
                  </div>

                  <div className="text-xs text-gray-600 text-center">
                    3 venues within 2 miles
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === i ? 'bg-purple-600 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl" />
      </div>
    </motion.div>
  );
}
