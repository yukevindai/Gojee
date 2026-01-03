'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  MapPin,
  Navigation,
  Star,
  Share2,
  Heart,
  RefreshCw,
  Shuffle,
  PlayCircle,
  ChevronRight,
  Check,
  Edit3
} from 'lucide-react';
import type { Plan } from '@/lib/planGenerator';
import type { Place } from '@/lib/places';
import { colorSchemes, type ColorScheme } from '@/lib/colorSchemes';
import { savePlan, unsavePlan, isPlanSaved } from '@/lib/savedPlans';

interface PlanSummaryPanelProps {
  plan: Plan;
  colorScheme: ColorScheme;
  onClose: () => void;
  onStartPlan: () => void;
  onSwapRestaurant: () => void;
  onSwapActivity: () => void;
  onRegenerate: () => void;
  onSwapStep?: (stepIndex: number) => void;
  onShuffleStep?: (stepIndex: number) => void;
  onSwapSideQuest?: (sideQuestIndex: number) => void;
  isEditingMode?: boolean;
  editingStepIndex?: number | null;
  onConfirmEdit?: () => void;
  onCancelEdit?: () => void;
}

export default function PlanSummaryPanel({
  plan,
  colorScheme,
  onClose,
  onStartPlan,
  onSwapRestaurant,
  onSwapActivity,
  onRegenerate,
  onSwapStep,
  onShuffleStep,
  onSwapSideQuest,
  isEditingMode,
  editingStepIndex,
  onConfirmEdit,
  onCancelEdit,
}: PlanSummaryPanelProps) {
  const colors = colorSchemes[colorScheme];
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  useEffect(() => {
    setIsSaved(isPlanSaved(plan.id));
  }, [plan.id]);

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

  const formatTime = (startMinutes: number, duration: number) => {
    const startHour = Math.floor(startMinutes / 60);
    const startMin = startMinutes % 60;
    const endMinutes = startMinutes + duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;

    const formatHourMin = (h: number, m: number) => {
      const hour = h % 12 || 12;
      const period = h >= 12 ? 'PM' : 'AM';
      return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
    };

    return `${formatHourMin(startHour, startMin)}–${formatHourMin(endHour, endMin)}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getSideQuestInfo = (place: Place) => {
    const types = place.types || [];

    // Check for specific types and return appropriate icon and label
    if (types.includes('cafe') || types.includes('coffee_shop')) {
      return { icon: '☕', label: 'Coffee stop', color: 'bg-amber-600' };
    } else if (types.includes('bar') || types.includes('night_club')) {
      return { icon: '🍺', label: 'Drinks', color: 'bg-purple-600' };
    } else if (types.includes('ice_cream_shop') || types.includes('bakery')) {
      return { icon: '🍦', label: 'Dessert', color: 'bg-pink-600' };
    } else if (types.includes('beach') || types.includes('natural_feature')) {
      return { icon: '🏖️', label: 'Beach visit', color: 'bg-cyan-600' };
    } else if (types.includes('tourist_attraction') || types.includes('landmark') || types.includes('historical_landmark')) {
      return { icon: '🗿', label: 'Landmark', color: 'bg-indigo-600' };
    } else if (types.includes('viewpoint') || types.includes('observation_deck')) {
      return { icon: '🔭', label: 'Viewpoint', color: 'bg-teal-600' };
    } else if (types.includes('amusement_center') || types.includes('arcade')) {
      return { icon: '🎮', label: 'Arcade', color: 'bg-violet-600' };
    } else if (types.includes('bowling_alley')) {
      return { icon: '🎳', label: 'Bowling', color: 'bg-blue-600' };
    } else if (types.includes('gym') || types.includes('fitness_center')) {
      return { icon: '💪', label: 'Fitness', color: 'bg-red-600' };
    } else if (types.includes('movie_theater')) {
      return { icon: '🎬', label: 'Cinema', color: 'bg-slate-600' };
    } else if (types.includes('book_store') || types.includes('library')) {
      return { icon: '📚', label: 'Books', color: 'bg-emerald-600' };
    } else if (types.includes('park')) {
      return { icon: '🌳', label: 'Park', color: 'bg-green-600' };
    } else if (types.includes('pier') || types.includes('marina')) {
      return { icon: '⚓', label: 'Waterfront', color: 'bg-sky-600' };
    }

    // Default fallback
    return { icon: '✨', label: 'Quick stop', color: 'bg-amber-500' };
  };

  const getTravelTime = () => {
    if (plan.distanceCategory === 'walking') return `${Math.ceil(plan.distance / 80)}m walk`;
    if (plan.distanceCategory === 'bussing') return `${Math.ceil(plan.distance / 250)}m bus`;
    return `${Math.ceil(plan.distance / 500)}m drive`;
  };

  const getWhyThisPlan = () => {
    const reasons = [];

    // Based on ratings
    const avgRating = (
      (plan.steps[0].place.rating || 0) +
      (plan.steps[1].place.rating || 0)
    ) / 2;
    if (avgRating >= 4.5) {
      reasons.push('Highly rated venues (4.5+ stars)');
    } else if (avgRating >= 4.0) {
      reasons.push('Great ratings from locals');
    }

    // Based on distance
    if (plan.distanceCategory === 'walking') {
      reasons.push('Everything within walking distance');
    } else if (plan.distanceCategory === 'bussing') {
      reasons.push('Short commute between spots');
    }

    // Based on vibe
    if (plan.vibe === 'romantic') {
      reasons.push('Perfect for a date night');
    } else if (plan.vibe === 'fun') {
      reasons.push('Great for groups and fun activities');
    } else if (plan.vibe === 'relaxed') {
      reasons.push('Chill and laid-back atmosphere');
    }

    // Add side quest benefit
    if (plan.sideQuests && plan.sideQuests.length > 0) {
      const questCount = plan.sideQuests.length;
      reasons.push(`${questCount} bonus ${questCount === 1 ? 'stop' : 'stops'} included`);
    }

    return reasons.slice(0, 3);
  };

  // Assume plan starts in 1 hour (you could make this customizable)
  const startTime = 60; // 1:00 PM = 780 minutes from midnight

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 z-30 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl"
    >
      {/* Header */}
      <div className={`sticky top-0 z-10 bg-gradient-to-r ${colors.diningGradient} px-6 py-4`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
            <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded-full p-2 hover:bg-white/50 transition-colors"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Editing Mode Banner */}
      <AnimatePresence>
        {isEditingMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sticky top-[72px] z-[9] bg-blue-50 border-b border-blue-200 px-6 py-3 overflow-hidden"
          >
            <div className="flex items-center gap-2 text-sm text-blue-900">
              <Edit3 className="h-4 w-4" />
              <span className="font-medium">Editing plan — changes won't start until you confirm</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 space-y-6">
        {/* Timeline */}
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <Clock className="h-5 w-5" />
            Timeline
          </h3>
          <div className="space-y-3">
            {/* All Main Steps */}
            {plan.steps.map((step, stepIndex) => {
              const cumulativeTime = plan.steps.slice(0, stepIndex).reduce((sum, s) => sum + s.duration, 0) + (stepIndex * 15);
              const isBeingEdited = isEditingMode && editingStepIndex === stepIndex;
              const isOtherStep = isEditingMode && editingStepIndex !== stepIndex;

              return (
                <div key={`step-${stepIndex}`}>
                  {/* Step */}
                  <div className={`flex items-start gap-3 transition-all ${
                    isBeingEdited ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg p-2 -m-2 bg-blue-50' :
                    isOtherStep ? 'opacity-40' : ''
                  }`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      step.type === 'dining' ? colors.diningIcon : colors.hangoutIcon
                    } text-white font-bold`}>
                      {stepIndex + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-900">
                          {step.place.name}
                          {isBeingEdited && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                              <Edit3 className="h-3 w-3" />
                              Editing
                            </span>
                          )}
                        </div>
                        {onShuffleStep && (
                          <button
                            onClick={() => onShuffleStep(stepIndex)}
                            className="ml-2 rounded-full p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Shuffle this location"
                          >
                            <Shuffle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTime(startTime + cumulativeTime, step.duration)} · {formatDuration(step.duration)}
                      </div>
                    </div>
                  </div>

                  {/* Travel indicator between steps */}
                  {stepIndex < plan.steps.length - 1 && (
                    <div className="ml-5 flex items-center gap-2 text-sm text-gray-500 my-2">
                      <Navigation className="h-4 w-4" />
                      <span>{getTravelTime()}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Side Quests (optional) */}
            {plan.sideQuests && plan.sideQuests.length > 0 && (
              <>
                <div className="ml-5 flex items-center gap-2 text-sm text-gray-500 pt-2">
                  <span className="italic">Optional {plan.sideQuests.length > 1 ? 'stops' : 'stop'}</span>
                </div>
                {plan.sideQuests.map((quest, idx) => {
                  const questInfo = getSideQuestInfo(quest.place);
                  return (
                    <div key={quest.place.id} className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${questInfo.color} text-white font-bold text-lg`}>
                        {questInfo.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">{quest.place.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{questInfo.label}</div>
                          </div>
                          {onSwapSideQuest && (
                            <button
                              onClick={() => onSwapSideQuest(idx)}
                              className="ml-2 rounded-full p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                              title="Shuffle this side quest"
                            >
                              <Shuffle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Anytime · {formatDuration(quest.duration)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Why This Plan */}
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
            <Star className="h-5 w-5" />
            Why This Plan
          </h3>
          <ul className="space-y-2">
            {getWhyThisPlan().map((reason, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <ChevronRight className="h-4 w-4 mt-0.5 text-green-600" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t">
          {isEditingMode ? (
            /* Editing Mode Actions */
            <div className="flex gap-3">
              <button
                onClick={onCancelEdit}
                className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-6 py-4 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmEdit}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Check className="h-5 w-5" />
                Confirm Changes
              </button>
            </div>
          ) : (
            <>
              {/* Primary: Start Plan */}
              <button
                onClick={onStartPlan}
                className={`w-full flex items-center justify-center gap-3 ${colors.button} text-white rounded-xl py-4 font-bold text-lg shadow-lg hover:shadow-xl transition-all`}
              >
                <PlayCircle className="h-6 w-6" />
                Start Plan
              </button>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onSwapRestaurant}
                  className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-xl py-3 font-medium text-sm text-gray-700 transition-colors"
                >
                  <Shuffle className="h-4 w-4" />
                  Swap Restaurant
                </button>
                <button
                  onClick={onSwapActivity}
                  className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-xl py-3 font-medium text-sm text-gray-700 transition-colors"
                >
                  <Shuffle className="h-4 w-4" />
                  Swap Activity
                </button>
              </div>

              {/* Utility Actions */}
              <div className="grid grid-cols-3 gap-2">
                <button className="flex flex-col items-center gap-1 bg-gray-50 hover:bg-gray-100 rounded-lg py-3 text-xs font-medium text-gray-600 transition-colors">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button
                  onClick={handleToggleSave}
                  className={`flex flex-col items-center gap-1 rounded-lg py-3 text-xs font-medium transition-colors ${
                    isSaved
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={onRegenerate}
                  className="flex flex-col items-center gap-1 bg-gray-50 hover:bg-gray-100 rounded-lg py-3 text-xs font-medium text-gray-600 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </button>
              </div>
            </>
          )}
        </div>
      </div>

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
    </motion.div>
  );
}
