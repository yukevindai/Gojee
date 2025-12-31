'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X } from 'lucide-react';
import { CUISINES } from '@/lib/cuisines';

interface CuisineFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
  usePreferences?: boolean; // Show "Auto (from preferences)" option
}

export default function CuisineFilter({ value, onChange, usePreferences = false }: CuisineFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCuisines = CUISINES.filter(cuisine =>
    cuisine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (cuisineId: string) => {
    if (value.includes(cuisineId)) {
      onChange(value.filter(id => id !== cuisineId));
    } else {
      onChange([...value, cuisineId]);
    }
  };

  const handleClear = () => {
    onChange([]);
    setSearchQuery('');
  };

  const handleSurprise = () => {
    // Pick 2-3 random cuisines
    const count = Math.floor(Math.random() * 2) + 2;
    const shuffled = [...CUISINES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count).map(c => c.id);
    onChange(selected);
    setIsOpen(false);
  };

  const getButtonText = () => {
    if (value.length === 0) {
      return usePreferences ? 'Cuisine (Auto)' : 'Cuisine';
    }
    if (value.length === 1) {
      const cuisine = CUISINES.find(c => c.id === value[0]);
      return cuisine ? `${cuisine.emoji} ${cuisine.name}` : 'Cuisine';
    }
    return `${value.length} Cuisines`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
          value.length > 0
            ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <span>{getButtonText()}</span>
        {value.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="rounded-full p-0.5 hover:bg-blue-200"
          >
            <X className="h-3 w-3" />
          </button>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border-2 border-gray-200 bg-white shadow-xl"
          >
            {/* Search Bar */}
            <div className="border-b border-gray-200 p-3">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-b border-gray-200 p-3">
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  No preference
                </button>
                <button
                  onClick={handleSurprise}
                  className="flex-1 rounded-lg border border-purple-500 bg-purple-50 px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-100"
                >
                  ✨ Surprise me
                </button>
              </div>
            </div>

            {/* Cuisine List */}
            <div className="max-h-64 overflow-y-auto p-3">
              <div className="grid grid-cols-2 gap-2">
                {filteredCuisines.map((cuisine) => {
                  const isSelected = value.includes(cuisine.id);
                  return (
                    <button
                      key={cuisine.id}
                      onClick={() => handleToggle(cuisine.id)}
                      className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-left text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span>{cuisine.emoji}</span>
                      <span className="flex-1">{cuisine.name}</span>
                      {isSelected && (
                        <span className="text-blue-500">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-3">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{value.length} selected</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
