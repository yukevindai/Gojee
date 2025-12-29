'use client';

import { motion } from 'framer-motion';
import { Star, Clock, DollarSign, MapPin, ArrowRight, Utensils, PartyPopper } from 'lucide-react';
import type { Plan } from '@/lib/planGenerator';

interface PlanCardProps {
  plan: Plan;
  index: number;
  onSelect: () => void;
  isSelected?: boolean;
  colorScheme?: 'orange' | 'purple' | 'green' | 'blue' | 'pink';
}

export default function PlanCard({ plan, index, onSelect, isSelected = false, colorScheme = 'orange' }: PlanCardProps) {
  const getPriceSymbol = (level: number) => {
    return '$'.repeat(level);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Color scheme configurations
  const colorSchemes = {
    orange: {
      border: 'border-orange-500',
      bg: 'bg-orange-50',
      badge: 'bg-orange-100 text-orange-700',
      button: 'bg-orange-500 hover:bg-orange-600',
      diningGradient: 'from-orange-50 to-red-50',
      diningIcon: 'bg-orange-500',
      hangoutGradient: 'from-amber-50 to-orange-50',
      hangoutIcon: 'bg-amber-500',
    },
    purple: {
      border: 'border-purple-500',
      bg: 'bg-purple-50',
      badge: 'bg-purple-100 text-purple-700',
      button: 'bg-purple-500 hover:bg-purple-600',
      diningGradient: 'from-purple-50 to-pink-50',
      diningIcon: 'bg-purple-500',
      hangoutGradient: 'from-violet-50 to-purple-50',
      hangoutIcon: 'bg-violet-500',
    },
    green: {
      border: 'border-green-500',
      bg: 'bg-green-50',
      badge: 'bg-green-100 text-green-700',
      button: 'bg-green-500 hover:bg-green-600',
      diningGradient: 'from-green-50 to-emerald-50',
      diningIcon: 'bg-green-500',
      hangoutGradient: 'from-teal-50 to-green-50',
      hangoutIcon: 'bg-teal-500',
    },
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      badge: 'bg-blue-100 text-blue-700',
      button: 'bg-blue-500 hover:bg-blue-600',
      diningGradient: 'from-blue-50 to-cyan-50',
      diningIcon: 'bg-blue-500',
      hangoutGradient: 'from-sky-50 to-blue-50',
      hangoutIcon: 'bg-sky-500',
    },
    pink: {
      border: 'border-pink-500',
      bg: 'bg-pink-50',
      badge: 'bg-pink-100 text-pink-700',
      button: 'bg-pink-500 hover:bg-pink-600',
      diningGradient: 'from-pink-50 to-rose-50',
      diningIcon: 'bg-pink-500',
      hangoutGradient: 'from-fuchsia-50 to-pink-50',
      hangoutIcon: 'bg-fuchsia-500',
    },
  };

  const colors = colorSchemes[colorScheme];

  const diningStep = plan.steps[0];
  const hangoutStep = plan.steps[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onSelect}
      className={`cursor-pointer overflow-hidden rounded-2xl border-2 bg-white p-5 shadow-lg transition-all hover:shadow-2xl ${
        isSelected
          ? `${colors.border} ${colors.bg}`
          : 'border-transparent hover:border-gray-200'
      }`}
    >
      {/* Plan Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
            <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
          </div>
          {isSelected && (
            <div className={`ml-2 rounded-full ${colors.button} px-3 py-1 text-xs font-semibold text-white`}>
              Selected
            </div>
          )}
        </div>

        {/* Plan Metadata */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(plan.totalDuration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>{getPriceSymbol(plan.estimatedCost)}</span>
          </div>
          <div className={`rounded-full ${colors.badge}`}>
            {plan.vibe}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {/* Step 1: Dining */}
        <div className={`flex items-start gap-3 rounded-xl bg-gradient-to-r ${colors.diningGradient} p-3`}>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors.diningIcon} text-white`}>
            <Utensils className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{diningStep.place.name}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{diningStep.place.address}</span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs">
              {diningStep.place.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-gray-900">
                    {diningStep.place.rating.toFixed(1)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(diningStep.duration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>

        {/* Step 2: Hangout */}
        <div className={`flex items-start gap-3 rounded-xl bg-gradient-to-r ${colors.hangoutGradient} p-3`}>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors.hangoutIcon} text-white`}>
            <PartyPopper className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{hangoutStep.place.name}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{hangoutStep.place.address}</span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs">
              {hangoutStep.place.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-gray-900">
                    {hangoutStep.place.rating.toFixed(1)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(hangoutStep.duration)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Select Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={`mt-4 w-full rounded-lg py-2.5 text-sm font-semibold transition-colors ${
          isSelected
            ? `${colors.button} text-white`
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isSelected ? 'Selected' : 'Select This Plan'}
      </button>
    </motion.div>
  );
}
