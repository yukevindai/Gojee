'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

interface QuickKeyButtonProps {
  label: string;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function QuickKeyButton({
  label,
  icon,
  isSelected,
  onClick,
}: QuickKeyButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={clsx(
        'relative flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all',
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-200 bg-white shadow-sm hover:border-gray-300 hover:shadow-md'
      )}
    >
      {/* Quick Key indicator badge */}
      <div className={clsx(
        'absolute right-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
        isSelected
          ? 'bg-blue-200 text-blue-700'
          : 'bg-gray-100 text-gray-500'
      )}>
        <span>⚡</span>
        <span>Quick</span>
      </div>

      <span className="text-2xl">{icon}</span>
      <span
        className={clsx(
          'text-center text-sm font-medium',
          isSelected ? 'text-blue-700' : 'text-gray-700'
        )}
      >
        {label}
      </span>
    </motion.button>
  );
}
