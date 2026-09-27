'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterDropdownProps {
  label: string;
  options: string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiSelect?: boolean;
}

export default function FilterDropdown({
  label,
  options,
  value,
  onChange,
  multiSelect = false,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (option: string) => {
    if (multiSelect) {
      const currentValues = value as string[];
      if (currentValues.includes(option)) {
        onChange(currentValues.filter((v) => v !== option));
      } else {
        onChange([...currentValues, option]);
      }
    } else {
      onChange(option);
      setIsOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (multiSelect) {
      const values = value as string[];
      if (values.length === 0) return label;
      if (values.length === 1) return values[0];
      return `${values.length} selected`;
    }
    return (value as string) || label;
  };

  const hasSelection = multiSelect
    ? (value as string[]).length > 0
    : value !== '';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
          hasSelection
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
            : 'bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 hover:border-purple-300'
        }`}
      >
        <span>{getDisplayValue()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 min-w-[200px]"
          >
            <div className="max-h-[300px] overflow-y-auto">
              {options.map((option) => {
                const isSelected = multiSelect
                  ? (value as string[]).includes(option)
                  : value === option;

                return (
                  <button
                    key={option}
                    onClick={() => handleToggle(option)}
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{option}</span>
                    {isSelected && (
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
