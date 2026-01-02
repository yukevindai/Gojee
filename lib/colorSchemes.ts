export type ColorScheme = 'orange' | 'purple' | 'green' | 'blue' | 'pink';

export interface ColorConfig {
  border: string;
  bg: string;
  badge: string;
  button: string;
  diningGradient: string;
  diningIcon: string;
  hangoutGradient: string;
  hangoutIcon: string;
  pinColor: string; // Hex color for map pins
  pinBorder: string; // Hex color for map pin borders
}

export const colorSchemes: Record<ColorScheme, ColorConfig> = {
  orange: {
    border: 'border-orange-500',
    bg: 'bg-orange-50',
    badge: 'bg-orange-100 text-orange-700',
    button: 'bg-orange-500 hover:bg-orange-600',
    diningGradient: 'from-orange-50 to-red-50',
    diningIcon: 'bg-orange-500',
    hangoutGradient: 'from-amber-50 to-orange-50',
    hangoutIcon: 'bg-amber-500',
    pinColor: '#F97316', // orange-500
    pinBorder: '#EA580C', // orange-600
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
    pinColor: '#A855F7', // purple-500
    pinBorder: '#9333EA', // purple-600
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
    pinColor: '#22C55E', // green-500
    pinBorder: '#16A34A', // green-600
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
    pinColor: '#3B82F6', // blue-500
    pinBorder: '#2563EB', // blue-600
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
    pinColor: '#EC4899', // pink-500
    pinBorder: '#DB2777', // pink-600
  },
};

export const getColorSchemeForIndex = (index: number): ColorScheme => {
  const schemes: ColorScheme[] = ['orange', 'purple', 'green', 'blue', 'pink'];
  // Handle negative indices by using absolute value or defaulting to 0
  const safeIndex = index >= 0 ? index : 0;
  return schemes[safeIndex % schemes.length];
};
