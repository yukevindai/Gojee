'use client';

import { motion } from 'framer-motion';
import { Star, Clock, DollarSign, MapPin, ArrowRight, Utensils, PartyPopper, Footprints, Bus, Car, Coffee, Gamepad2, Dumbbell, Film } from 'lucide-react';
import type { Plan } from '@/lib/planGenerator';
import { colorSchemes, type ColorScheme } from '@/lib/colorSchemes';

interface PlanCardProps {
  plan: Plan;
  index: number;
  onSelect: () => void;
  isSelected?: boolean;
  colorScheme?: ColorScheme;
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

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getDistanceIcon = (category: 'walking' | 'bussing' | 'driving') => {
    switch (category) {
      case 'walking':
        return <Footprints className="h-3 w-3" />;
      case 'bussing':
        return <Bus className="h-3 w-3" />;
      case 'driving':
        return <Car className="h-3 w-3" />;
    }
  };

  const getSideQuestInfo = (types?: string[]) => {
    if (!types) return { icon: <Coffee className="h-4 w-4" />, message: '☕ Grab a quick stop on your way!' };

    if (types.includes('cafe') || types.includes('bakery')) {
      return { icon: <Coffee className="h-4 w-4" />, message: '☕ Grab coffee or bubble tea on your way!' };
    }
    if (types.includes('amusement_center') || types.includes('arcade')) {
      return { icon: <Gamepad2 className="h-4 w-4" />, message: '🎮 Stop by for some games!' };
    }
    if (types.includes('gym') || types.includes('fitness')) {
      return { icon: <Dumbbell className="h-4 w-4" />, message: '💪 Hit the gym on your way!' };
    }
    if (types.includes('movie_theater')) {
      return { icon: <Film className="h-4 w-4" />, message: '🎬 Catch a movie!' };
    }

    // Default
    return { icon: <Coffee className="h-4 w-4" />, message: '☕ Grab a quick stop on your way!' };
  };

  const colors = colorSchemes[colorScheme];

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
          <div className="flex items-center gap-1">
            {getDistanceIcon(plan.distanceCategory)}
            <span className="capitalize">{plan.distanceCategory} · {formatDistance(plan.distance)}</span>
          </div>
          <div className={`rounded-full px-2 py-0.5 ${colors.badge}`}>
            {plan.vibe}
          </div>
        </div>
      </div>

      {/* All Steps */}
      <div className="space-y-3">
        {plan.steps.map((step, stepIndex) => (
          <div key={`${step.place.id}-${stepIndex}`}>
            {/* Step Card */}
            <div className={`flex items-start gap-3 rounded-xl bg-gradient-to-r ${
              step.type === 'dining' ? colors.diningGradient : colors.hangoutGradient
            } p-3`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                step.type === 'dining' ? colors.diningIcon : colors.hangoutIcon
              } text-white`}>
                {step.type === 'dining' ? <Utensils className="h-4 w-4" /> : <PartyPopper className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{step.place.name}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{step.place.address}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs">
                  {step.place.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-gray-900">
                        {step.place.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(step.duration)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow between steps (not after the last step) */}
            {stepIndex < plan.steps.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {/* Side Quests (Optional) */}
        {plan.sideQuests && plan.sideQuests.length > 0 && (
          <>
            {/* Side Quest Maxxing Header */}
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                <span>Side Quest Maxxing?</span>
              </div>
            </div>

            {/* Collective Box for All Side Quests */}
            <div className="relative rounded-xl border-2 border-dashed border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 space-y-3">
              {plan.sideQuests.map((sideQuest, idx) => {
                const sideQuestInfo = getSideQuestInfo(sideQuest.place.types);
                return (
                  <div key={sideQuest.place.id} className={idx > 0 ? "pt-3 border-t border-amber-200" : ""}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                        {sideQuestInfo.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{sideQuest.place.name}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{sideQuest.place.address}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs">
                          {sideQuest.place.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium text-gray-900">
                                {sideQuest.place.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(sideQuest.duration)}</span>
                          </div>
                        </div>
                        <div className="mt-2 rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">
                          {sideQuestInfo.message}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
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
