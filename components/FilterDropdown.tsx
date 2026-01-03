'use client';

import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface FilterDropdownProps {
  label: string;
  options: string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiSelect?: boolean;
  icon?: React.ReactNode;
}

export default function FilterDropdown({
  label,
  options,
  value,
  onChange,
  multiSelect = false,
  icon,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    if (multiSelect) {
      const currentValues = value as string[];
      const newValues = currentValues.includes(option)
        ? currentValues.filter((v) => v !== option)
        : [...currentValues, option];
      onChange(newValues);
    } else {
      onChange(option);
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (multiSelect) {
      const selectedCount = (value as string[]).length;
      if (selectedCount === 0) return label;
      if (selectedCount === 1) return (value as string[])[0];
      return `${selectedCount} selected`;
    }
    return (value as string) || label;
  };

  const hasSelection = multiSelect
    ? (value as string[]).length > 0
    : Boolean(value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all shadow-sm',
          hasSelection
            ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100'
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
        )}
      >
        {icon && <span className="flex items-center">{icon}</span>}
        <span>{getDisplayText()}</span>
        <ChevronDown
          className={clsx(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-12 z-20 min-w-[200px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
            >
              <div className="max-h-64 overflow-y-auto p-2">
                {options.map((option) => {
                  const isSelected = multiSelect
                    ? (value as string[]).includes(option)
                    : value === option;

                  return (
                    <button
                      key={option}
                      onClick={() => handleSelect(option)}
                      className={clsx(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                        isSelected
                          ? 'bg-blue-50 font-semibold text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <span>{option}</span>
                      {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
