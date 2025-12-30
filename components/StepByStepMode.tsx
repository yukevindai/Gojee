'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Star,
  Phone,
  Navigation,
  Share2,
  Clock,
  DollarSign,
  CheckCircle,
  SkipForward,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import type { Plan, ActivityStep } from '@/lib/planGenerator';
import { colorSchemes, type ColorScheme } from '@/lib/colorSchemes';

interface StepByStepModeProps {
  plan: Plan;
  colorScheme: ColorScheme;
  currentStepIndex: number;
  onComplete: () => void;
  onSkip: () => void;
  onDelay: () => void;
  onNext: () => void;
  onClose: () => void;
}

export default function StepByStepMode({
  plan,
  colorScheme,
  currentStepIndex,
  onComplete,
  onSkip,
  onDelay,
  onNext,
  onClose,
}: StepByStepModeProps) {
  const colors = colorSchemes[colorScheme];

  // Include side quests as steps if they exist
  const allSteps: ActivityStep[] = [...plan.steps];
  if (plan.sideQuests && plan.sideQuests.length > 0) {
    allSteps.push(...plan.sideQuests);
  }

  const currentStep = allSteps[currentStepIndex];
  const nextStep = currentStepIndex < allSteps.length - 1 ? allSteps[currentStepIndex + 1] : null;
  const isLastStep = currentStepIndex === allSteps.length - 1;

  const getPriceSymbol = (level?: number) => {
    if (!level) return '$$';
    return '$'.repeat(level);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getStepTitle = (index: number) => {
    if (index < 2) {
      return index === 0 ? 'Dining' : 'Activity';
    }
    return 'Side Quest';
  };

  const getStepIcon = (index: number) => {
    if (index === 0) return colors.diningIcon;
    if (index === 1) return colors.hangoutIcon;
    return 'bg-amber-500';
  };

  const handleGetDirections = () => {
    const { lat, lng } = currentStep.place.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleCall = () => {
    // In a real app, you'd get the phone number from the place details
    alert('Phone number would be displayed here. This requires additional Place Details API call.');
  };

  const handleShare = async () => {
    const shareData = {
      title: plan.name,
      text: `Join me at ${currentStep.place.name}! Part of our ${plan.name} plan.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `${shareData.text}\n${currentStep.place.address}`
      );
      alert('Plan details copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-white overflow-y-auto">
      {/* Header */}
      <div className={`sticky top-0 bg-gradient-to-r ${colors.diningGradient} px-4 py-4 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-600">
              Step {currentStepIndex + 1} of {allSteps.length}
            </div>
            <div className="text-lg font-bold text-gray-900">{getStepTitle(currentStepIndex)}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/50 transition-colors"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
          <motion.div
            className={colors.button}
            initial={{ width: 0 }}
            animate={{ width: `${((currentStepIndex + 1) / allSteps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Current Step - Large Card */}
      <div className="p-4">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6"
        >
          {/* Place Info */}
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${getStepIcon(currentStepIndex)} text-white font-bold text-lg`}>
                {currentStepIndex + 1}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {currentStep.place.name}
                </h2>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  {currentStep.place.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">{currentStep.place.rating.toFixed(1)}</span>
                      {currentStep.place.userRatingsTotal && (
                        <span>({currentStep.place.userRatingsTotal})</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{getPriceSymbol(currentStep.place.priceLevel)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(currentStep.duration)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-gray-700">
              <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-gray-400" />
              <span>{currentStep.place.address}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGetDirections}
              className={`w-full flex items-center justify-center gap-3 ${colors.button} text-white rounded-xl py-4 font-semibold shadow-md hover:shadow-lg transition-all`}
            >
              <Navigation className="h-5 w-5" />
              Get Directions
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCall}
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-xl py-3 font-medium text-gray-700 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-xl py-3 font-medium text-gray-700 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>

          {/* Completion Controls */}
          <div className="border-t pt-4 space-y-3">
            <button
              onClick={onComplete}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 font-semibold transition-colors"
            >
              <CheckCircle className="h-5 w-5" />
              {isLastStep ? 'Complete Plan' : 'Arrived - Next Step'}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onSkip}
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 transition-colors"
              >
                <SkipForward className="h-4 w-4" />
                Skip This
              </button>
              <button
                onClick={onDelay}
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 transition-colors"
              >
                <AlertCircle className="h-4 w-4" />
                Delay/Adjust
              </button>
            </div>
          </div>
        </motion.div>

        {/* Next Step Preview */}
        {nextStep && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-600">
              <ChevronRight className="h-4 w-4" />
              Next: {getStepTitle(currentStepIndex + 1)}
            </div>
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getStepIcon(currentStepIndex + 1)} text-white font-bold`}>
                {currentStepIndex + 2}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{nextStep.place.name}</div>
                <div className="text-sm text-gray-600">{formatDuration(nextStep.duration)}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
