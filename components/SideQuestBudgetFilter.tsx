'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Coffee, Check } from 'lucide-react';
import type { PriceLevel } from './PriceFilter';

interface SideQuestBudgetFilterProps {
  value: PriceLevel[];
  onChange: (value: PriceLevel[]) => void;
}

const BUDGET_OPTIONS = [
  { level: 1 as PriceLevel, label: 'Under $10', symbol: '$', example: 'Coffee, bubble tea' },
  { level: 2 as PriceLevel, label: '$10-$25', symbol: '$$', example: 'Dessert, casual snacks' },
  { level: 3 as PriceLevel, label: '$25+', symbol: '$$$', example: 'Premium cafés, treats' },
];

export default function SideQuestBudgetFilter({ value, onChange }: SideQuestBudgetFilterProps) {
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
    if (value.length === 0) return 'Any Budget';
    if (value.length === BUDGET_OPTIONS.length) return 'Any Budget';

    const symbols = value.map(v => BUDGET_OPTIONS.find(p => p.level === v)?.symbol).join(' ');
    return symbols;
  };

  const hasSelection = value.length > 0 && value.length < BUDGET_OPTIONS.length;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
          hasSelection
            ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Coffee className="h-4 w-4" />
        <span>Side Quest: {getDisplayText()}</span>
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
            className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl"
          >
            <div className="p-4">
              <h3 className="mb-1 text-sm font-semibold text-gray-900">Side Quest Budget</h3>
              <p className="mb-3 text-xs text-gray-600">
                Control cost of optional stops (coffee, desserts, etc.)
              </p>

              <div className="space-y-2">
                {BUDGET_OPTIONS.map((option) => {
                  const isSelected = value.includes(option.level);

                  return (
                    <button
                      key={option.level}
                      onClick={() => handleToggle(option.level)}
                      className={`w-full flex items-center justify-between rounded-lg p-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-amber-50 border border-amber-200'
                          : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-gray-900">
                            {option.symbol}
                          </span>
                          <span className="font-medium text-gray-900">
                            {option.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-600">
                          {option.example}
                        </p>
                      </div>

                      {isSelected && (
                        <Check className="h-5 w-5 text-amber-600" />
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
