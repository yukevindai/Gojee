import { DollarSign } from 'lucide-react';

interface PriceIndicatorProps {
  level?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function PriceIndicator({ level, size = 'md', showLabel = false }: PriceIndicatorProps) {
  if (!level) return null;

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const symbols = '$'.repeat(Math.min(level, 4));

  const getColorClass = () => {
    switch (level) {
      case 1:
        return 'text-green-600';
      case 2:
        return 'text-yellow-600';
      case 3:
        return 'text-orange-600';
      case 4:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getLabel = () => {
    switch (level) {
      case 1:
        return 'Budget';
      case 2:
        return 'Moderate';
      case 3:
        return 'Upscale';
      case 4:
        return 'Premium';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center gap-1">
      <span className={`font-bold ${getColorClass()} ${textSizeClasses[size]}`}>
        {symbols}
      </span>
      {showLabel && (
        <span className={`text-gray-600 ${textSizeClasses[size]}`}>
          {getLabel()}
        </span>
      )}
    </div>
  );
}
