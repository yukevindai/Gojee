'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import type { Plan } from '@/lib/planGenerator';

interface SpinningWheelProps {
  plans: Plan[];
  isOpen: boolean;
  onClose: () => void;
  onPlanSelected: (plan: Plan) => void;
}

export default function SpinningWheel({
  plans,
  isOpen,
  onClose,
  onPlanSelected,
}: SpinningWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [rotation, setRotation] = useState(0);

  const colors = [
    '#3B82F6', // blue-500
    '#EF4444', // red-500
    '#10B981', // green-500
    '#F59E0B', // amber-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#14B8A6', // teal-500
    '#F97316', // orange-500
  ];

  const spinWheel = () => {
    if (isSpinning || plans.length === 0) return;

    setIsSpinning(true);
    setSelectedPlan(null);

    // Random plan selection
    const randomIndex = Math.floor(Math.random() * plans.length);
    const selectedPlan = plans[randomIndex];

    // Calculate rotation: multiple full spins + landing on selected segment
    const segmentAngle = 360 / plans.length;
    const targetAngle = 360 - (randomIndex * segmentAngle + segmentAngle / 2);
    const spins = 5; // Number of full rotations
    const finalRotation = rotation + spins * 360 + targetAngle;

    setRotation(finalRotation);

    // After animation completes, show the result
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPlan(selectedPlan);
    }, 4000);
  };

  const handleConfirm = () => {
    if (selectedPlan) {
      onPlanSelected(selectedPlan);
      onClose();
    }
  };

  const handleReset = () => {
    setSelectedPlan(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-2xl w-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-yellow-300" />
                  <h2 className="text-2xl font-bold text-white">Lucky Plan Picker</h2>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
              <p className="mt-2 text-sm text-blue-100">
                Can't decide? Let fate choose your perfect plan!
              </p>
            </div>

            {/* Wheel Container */}
            <div className="p-8">
              <div className="relative flex items-center justify-center">
                {/* Pointer Arrow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
                  <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-red-500 drop-shadow-lg" />
                </div>

                {/* Spinning Wheel */}
                <div className="relative w-80 h-80">
                  <motion.div
                    className="absolute inset-0 rounded-full shadow-2xl overflow-hidden border-8 border-white"
                    animate={{ rotate: rotation }}
                    transition={{
                      duration: 4,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {plans.map((plan, index) => {
                        const segmentAngle = 360 / plans.length;
                        const startAngle = index * segmentAngle - 90;
                        const endAngle = startAngle + segmentAngle;

                        const startRad = (startAngle * Math.PI) / 180;
                        const endRad = (endAngle * Math.PI) / 180;

                        const x1 = 50 + 50 * Math.cos(startRad);
                        const y1 = 50 + 50 * Math.sin(startRad);
                        const x2 = 50 + 50 * Math.cos(endRad);
                        const y2 = 50 + 50 * Math.sin(endRad);

                        const largeArc = segmentAngle > 180 ? 1 : 0;
                        const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

                        return (
                          <path
                            key={plan.id}
                            d={pathData}
                            fill={colors[index % colors.length]}
                            stroke="white"
                            strokeWidth="0.5"
                          />
                        );
                      })}
                    </svg>

                    {/* Plan numbers and names on wheel */}
                    {plans.map((plan, index) => {
                      const segmentAngle = 360 / plans.length;
                      const angle = index * segmentAngle + segmentAngle / 2 - 90;

                      // Position for plan name (inner)
                      const nameRadius = 30;
                      const nameX = 50 + nameRadius * Math.cos((angle * Math.PI) / 180);
                      const nameY = 50 + nameRadius * Math.sin((angle * Math.PI) / 180);

                      // Position for plan number badge (outer)
                      const badgeRadius = 42;
                      const badgeX = 50 + badgeRadius * Math.cos((angle * Math.PI) / 180);
                      const badgeY = 50 + badgeRadius * Math.sin((angle * Math.PI) / 180);

                      return (
                        <div key={plan.id}>
                          {/* Plan Number Badge */}
                          <div
                            className="absolute w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center pointer-events-none"
                            style={{
                              left: `${badgeX}%`,
                              top: `${badgeY}%`,
                              transform: `translate(-50%, -50%)`,
                            }}
                          >
                            <span className="text-xs font-bold" style={{ color: colors[index % colors.length] }}>
                              {index + 1}
                            </span>
                          </div>

                          {/* Plan Name */}
                          <div
                            className="absolute text-xs font-bold text-white text-center pointer-events-none"
                            style={{
                              left: `${nameX}%`,
                              top: `${nameY}%`,
                              transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                              width: '60px',
                            }}
                          >
                            {plan.name.split(':')[0].slice(0, 15)}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>

                  {/* Center Circle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg border-4 border-white flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Plan Legend */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {plans.map((plan, index) => (
                  <div
                    key={plan.id}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    >
                      {index + 1}
                    </div>
                    <span className="text-xs text-gray-700 truncate">
                      {plan.name.split(':')[0]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Result Display */}
              <AnimatePresence>
                {selectedPlan && !isSpinning && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-8 p-6 bg-white rounded-2xl shadow-lg border-2 border-blue-200"
                  >
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-3">
                        <Sparkles className="h-5 w-5 text-white" />
                        <span className="text-sm font-bold text-white">Your Lucky Plan!</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedPlan.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {selectedPlan.description}
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={handleReset}
                          className="px-6 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                          Spin Again
                        </button>
                        <button
                          onClick={handleConfirm}
                          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg"
                        >
                          Let's Go!
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spin Button */}
              {!selectedPlan && (
                <div className="mt-8 text-center">
                  <motion.button
                    onClick={spinWheel}
                    disabled={isSpinning}
                    whileHover={{ scale: isSpinning ? 1 : 1.05 }}
                    whileTap={{ scale: isSpinning ? 1 : 0.95 }}
                    className={`
                      px-8 py-4 rounded-full text-lg font-bold text-white shadow-xl
                      transition-all transform
                      ${
                        isSpinning
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      }
                    `}
                  >
                    {isSpinning ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="h-6 w-6" />
                        </motion.div>
                        Spinning...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6" />
                        Spin the Wheel!
                      </span>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
