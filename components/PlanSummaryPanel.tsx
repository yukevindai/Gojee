'use client';

import { motion } from 'framer-motion';
import {
  X,
  Clock,
  MapPin,
  Navigation,
  Star,
  Share2,
  Bookmark,
  RefreshCw,
  Shuffle,
  PlayCircle,
  ChevronRight
} from 'lucide-react';
import type { Plan } from '@/lib/planGenerator';
import { colorSchemes, type ColorScheme } from '@/lib/colorSchemes';

interface PlanSummaryPanelProps {
  plan: Plan;
  colorScheme: ColorScheme;
  onClose: () => void;
  onStartPlan: () => void;
  onSwapRestaurant: () => void;
  onSwapActivity: () => void;
  onRegenerate: () => void;
  onSwapStep?: (stepIndex: number) => void;
  onSwapSideQuest?: (sideQuestIndex: number) => void;
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
  onSwapSideQuest,
}: PlanSummaryPanelProps) {
  const colors = colorSchemes[colorScheme];

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
      <div className={`sticky top-0 bg-gradient-to-r ${colors.diningGradient} px-6 py-4`}>
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
              return (
                <div key={`step-${stepIndex}`}>
                  {/* Step */}
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      step.type === 'dining' ? colors.diningIcon : colors.hangoutIcon
                    } text-white font-bold`}>
                      {stepIndex + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-900">{step.place.name}</div>
                        {onSwapStep && (
                          <button
                            onClick={() => onSwapStep(stepIndex)}
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
                {plan.sideQuests.map((quest, idx) => (
                  <div key={quest.place.id} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-bold">
                      {plan.steps.length + idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-900">{quest.place.name}</div>
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
                ))}
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
            <button className="flex flex-col items-center gap-1 bg-gray-50 hover:bg-gray-100 rounded-lg py-3 text-xs font-medium text-gray-600 transition-colors">
              <Bookmark className="h-4 w-4" />
              Save
            </button>
            <button
              onClick={onRegenerate}
              className="flex flex-col items-center gap-1 bg-gray-50 hover:bg-gray-100 rounded-lg py-3 text-xs font-medium text-gray-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
