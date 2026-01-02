'use client';

import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import type { Place } from '@/lib/places';

interface NumberedMarkerProps {
  place: Place;
  number: number;
  type: 'restaurant' | 'activity' | 'optional';
  onClick?: () => void;
  isEditing?: boolean;
  isCurrentStep?: boolean;
  isDimmed?: boolean;
}

export default function NumberedMarker({
  place,
  number,
  type,
  onClick,
  isEditing = false,
  isCurrentStep = false,
  isDimmed = false,
}: NumberedMarkerProps) {
  // Color scheme based on type
  const getColors = () => {
    if (type === 'restaurant') {
      return {
        background: '#ef4444', // red-500
        border: '#dc2626', // red-600
        glyph: '#ffffff',
      };
    } else if (type === 'activity') {
      return {
        background: '#10b981', // green-500
        border: '#059669', // green-600
        glyph: '#ffffff',
      };
    } else {
      // optional
      return {
        background: '#f59e0b', // amber-500
        border: '#d97706', // amber-600
        glyph: '#ffffff',
      };
    }
  };

  const colors = getColors();

  // Adjust opacity if dimmed
  const opacity = isDimmed ? 0.4 : 1.0;

  // Scale up if current step
  const scale = isCurrentStep ? 1.3 : 1.0;

  // Add pulse animation for editing
  const glowEffect = isEditing ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' : '';

  return (
    <AdvancedMarker
      position={{ lat: place.location.lat, lng: place.location.lng }}
      onClick={onClick}
      style={{
        transform: `scale(${scale})`,
        opacity,
        filter: glowEffect,
        transition: 'all 0.3s ease',
      }}
    >
      <div className="relative">
        {/* Custom Pin with Number */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-lg transition-all hover:scale-110"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
        >
          <span
            className="text-sm font-bold"
            style={{ color: colors.glyph }}
          >
            {number}
          </span>
        </div>

        {/* Pin stem */}
        <div
          className="absolute left-1/2 top-full h-2 w-1 -translate-x-1/2"
          style={{
            backgroundColor: colors.border,
          }}
        />

        {/* Editing indicator ring */}
        {isEditing && (
          <div
            className="absolute inset-0 -m-1 animate-ping rounded-full border-2 border-blue-500"
            style={{ animationDuration: '2s' }}
          />
        )}

        {/* Current step pulse */}
        {isCurrentStep && (
          <div
            className="absolute inset-0 -m-2 animate-pulse rounded-full"
            style={{
              backgroundColor: colors.background,
              opacity: 0.3,
            }}
          />
        )}
      </div>
    </AdvancedMarker>
  );
}
