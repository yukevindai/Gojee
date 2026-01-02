'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, DollarSign, Check } from 'lucide-react';

export type PriceLevel = 1 | 2 | 3 | 4;

interface PriceLevelOption {
  level: PriceLevel;
  label: string;
  description: string;
  symbol: string;
}

const PRICE_LEVELS: PriceLevelOption[] = [
  { level: 1, label: 'Budget-Friendly', description: 'Inexpensive', symbol: '$' },
  { level: 2, label: 'Moderate', description: 'Mid-range', symbol: '$$' },
  { level: 3, label: 'Upscale', description: 'Higher-end', symbol: '$$$' },
  { level: 4, label: 'Premium', description: 'Fine dining/luxury', symbol: '$$$$' },
];

interface PriceFilterProps {
  value: PriceLevel[];
  onChange: (value: PriceLevel[]) => void;
}

export default function PriceFilter({ value, onChange }: PriceFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = (level: PriceLevel) => {
    if (value.includes(level)) {
      onChange(value.filter(v => v !== level));
    } else {
      onChange([...value, level].sort());
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) return 'Any Price';
    if (value.length === PRICE_LEVELS.length) return 'Any Price';

    const symbols = value.map(v => PRICE_LEVELS.find(p => p.level === v)?.symbol).join(' ');
    return symbols;
  };

  const hasSelection = value.length > 0 && value.length < PRICE_LEVELS.length;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
          hasSelection
            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <DollarSign className="h-4 w-4" />
        <span>{getDisplayText()}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white shadow-xl"
          >
            <div className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Price Range</h3>

              <div className="space-y-2">
                {PRICE_LEVELS.map((option) => {
                  const isSelected = value.includes(option.level);

                  return (
                    <button
                      key={option.level}
                      onClick={() => handleToggle(option.level)}
                      className={`w-full flex items-center justify-between rounded-lg p-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            {option.symbol}
                          </span>
                          <span className="font-medium text-gray-900">
                            {option.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-600">
                          {option.description}
                        </p>
                      </div>

                      {isSelected && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    onChange([]);
                    setIsOpen(false);
                  }}
                  className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Clear Filter
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
