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
        'flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all',
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-200 bg-white shadow-sm hover:border-gray-300 hover:shadow-md'
      )}
    >
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
