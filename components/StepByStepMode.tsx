'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Star,
  Phone,
  Navigation,
  Share2,
  Heart,
  Clock,
  DollarSign,
  CheckCircle,
  SkipForward,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Shuffle,
  TrendingUp,
  Info,
  Zap
} from 'lucide-react';
import type { Plan, ActivityStep } from '@/lib/planGenerator';
import type { Place } from '@/lib/places';
import { colorSchemes, type ColorScheme } from '@/lib/colorSchemes';
import { savePlan, unsavePlan, isPlanSaved } from '@/lib/savedPlans';

interface StepByStepModeProps {
  plan: Plan;
  colorScheme: ColorScheme;
  currentStepIndex: number;
  onComplete: () => void;
  onSkip: () => void;
  onDelay: () => void;
  onNext: () => void;
  onClose: () => void;
  onSwapStep?: (stepIndex: number) => void;
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
  onSwapStep,
}: StepByStepModeProps) {
  const colors = colorSchemes[colorScheme];
  const [showTimeline, setShowTimeline] = useState(false);
  const [showWhyThis, setShowWhyThis] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  useEffect(() => {
    setIsSaved(isPlanSaved(plan.id));
  }, [plan.id]);

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
    const step = allSteps[index];
    if (step.type === 'dining') return 'Dining';
    if (step.type === 'hangout') return 'Activity';
    return 'Side Quest';
  };

  const getStepIcon = (index: number) => {
    const step = allSteps[index];
    if (step.type === 'dining') return colors.diningIcon;
    if (step.type === 'hangout') return colors.hangoutIcon;
    return 'bg-amber-500';
  };

  // Generate reason for why this place was chosen
  const getWhyChosen = (step: ActivityStep) => {
    const reasons = [];

    if (step.place.rating && step.place.rating >= 4.5) {
      reasons.push('Highly rated by visitors');
    }

    if (step.place.userRatingsTotal && step.place.userRatingsTotal > 500) {
      reasons.push('Popular destination');
    }

    if (step.place.priceLevel && step.place.priceLevel <= 2) {
      reasons.push('Great value');
    }

    // Check if it's close to next step
    if (nextStep) {
      reasons.push('Conveniently located near your next stop');
    }

    if (reasons.length === 0) {
      reasons.push('Matches your preferences and plan type');
    }

    return reasons;
  };

  const handleGetDirections = () => {
    const { lat, lng } = currentStep.place.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleCall = () => {
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
      navigator.clipboard.writeText(
        `${shareData.text}\n${currentStep.place.address}`
      );
      alert('Plan details copied to clipboard!');
    }
  };

  const handleToggleSave = () => {
    if (isSaved) {
      unsavePlan(plan.id);
      setIsSaved(false);
    } else {
      savePlan(plan);
      setIsSaved(true);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2000);
    }
  };

  const handleAdjustTiming = (minutes: number) => {
    setDelayMinutes(minutes);
    alert(`Timeline adjusted by +${minutes} minutes`);
    setShowMoreOptions(false);
  };

  const handleSwap = () => {
    if (onSwapStep) {
      onSwapStep(currentStepIndex);
    } else {
      alert('Swap feature coming soon!');
    }
  };

  const reasons = getWhyChosen(currentStep);

  return (
    <div className="fixed inset-0 z-40 bg-white overflow-y-auto">
      {/* Header */}
      <div className={`sticky top-0 bg-gradient-to-r ${colors.diningGradient} px-4 py-4 shadow-sm z-10`}>
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
      <div className="p-4 pb-24">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden"
        >
          {/* Place Info */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-3 mb-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${getStepIcon(currentStepIndex)} text-white font-bold text-lg`}>
                {currentStepIndex + 1}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {currentStep.place.name}
                </h2>
                <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                  {currentStep.place.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">{currentStep.place.rating.toFixed(1)}</span>
                      {currentStep.place.userRatingsTotal && (
                        <span>({currentStep.place.userRatingsTotal.toLocaleString()})</span>
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

            <div className="flex items-start gap-2 text-gray-700 mb-4">
              <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-gray-400" />
              <span>{currentStep.place.address}</span>
            </div>

            {/* Why This Place - Expandable */}
            <button
              onClick={() => setShowWhyThis(!showWhyThis)}
              className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 rounded-lg px-4 py-3 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Why this place?
                </span>
              </div>
              <ChevronDown className={`h-4 w-4 text-blue-600 transition-transform ${showWhyThis ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showWhyThis && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-2">
                    {reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <Zap className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Primary Action - Always Visible */}
          <div className="px-6 pb-4">
            <button
              onClick={handleGetDirections}
              className={`w-full flex items-center justify-center gap-3 ${colors.button} text-white rounded-xl py-4 font-semibold shadow-md hover:shadow-lg transition-all`}
            >
              <Navigation className="h-5 w-5" />
              Get Directions
            </button>
          </div>

          {/* Secondary Actions - Visible but Secondary */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleSwap}
                className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl py-3 font-medium transition-colors"
              >
                <Shuffle className="h-4 w-4" />
                Swap
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-xl py-3 font-medium text-gray-700 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button
                onClick={handleToggleSave}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 font-medium transition-colors ${
                  isSaved
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          {/* More Options - Progressive Disclosure */}
          <div className="px-6 pb-4">
            <button
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 py-2 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
              More options
              <ChevronDown className={`h-4 w-4 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showMoreOptions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-medium text-gray-600 mb-2">Running late?</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAdjustTiming(15)}
                        className="flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg py-2 text-sm font-medium transition-colors"
                      >
                        <Clock className="h-4 w-4" />
                        +15 min
                      </button>
                      <button
                        onClick={() => handleAdjustTiming(30)}
                        className="flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg py-2 text-sm font-medium transition-colors"
                      >
                        <Clock className="h-4 w-4" />
                        +30 min
                      </button>
                    </div>

                    <div className="text-xs font-medium text-gray-600 mt-3 mb-2">Having issues?</div>
                    <button
                      onClick={handleSwap}
                      className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg py-2 text-sm font-medium transition-colors"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Place is closed/too busy
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Completion Controls - Always Visible */}
          <div className="border-t px-6 py-4 bg-gray-50">
            <button
              onClick={onComplete}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl py-3.5 font-semibold transition-colors shadow-md"
            >
              <CheckCircle className="h-5 w-5" />
              {isLastStep ? '✓ Complete Plan' : 'Arrived - Next Step'}
            </button>

            <button
              onClick={onSkip}
              className="w-full mt-2 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 py-2 transition-colors"
            >
              <SkipForward className="h-4 w-4" />
              Skip this step
            </button>
          </div>
        </motion.div>

        {/* Next Step Preview */}
        {nextStep && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-600">
              <ChevronRight className="h-4 w-4" />
              Next up: {getStepTitle(currentStepIndex + 1)}
            </div>
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getStepIcon(currentStepIndex + 1)} text-white font-bold`}>
                {currentStepIndex + 2}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">{nextStep.place.name}</div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(nextStep.duration)}
                  </div>
                  {nextStep.place.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {nextStep.place.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Timeline - Expandable */}
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="mt-4 w-full flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              View full timeline
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${showTimeline ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 bg-white rounded-xl border border-gray-200 p-4">
                <div className="space-y-3">
                  {allSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 ${idx === currentStepIndex ? 'opacity-100' : 'opacity-50'}`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getStepIcon(idx)} text-white font-bold text-sm`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{step.place.name}</div>
                        <div className="text-xs text-gray-600">{formatDuration(step.duration)}</div>
                      </div>
                      {idx === currentStepIndex && (
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Current
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total duration</span>
                    <span className="font-semibold text-gray-900">{formatDuration(plan.totalDuration)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Toast */}
        <AnimatePresence>
          {showSaveToast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
            >
              <Heart className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">Plan saved!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
