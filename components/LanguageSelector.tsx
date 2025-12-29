'use client';

import { Globe } from 'lucide-react';
import { useState } from 'react';

export default function LanguageSelector() {
  const [language, setLanguage] = useState('EN');
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'EN', label: 'English' },
    { code: 'ES', label: 'Español' },
    { code: 'FR', label: 'Français' },
    { code: 'DE', label: 'Deutsch' },
    { code: 'ZH', label: '中文' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
      >
        <Globe className="h-4 w-4" />
        {language}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-20 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 ${
                  language === lang.code
                    ? 'bg-gray-50 font-semibold text-gray-900'
                    : 'text-gray-700'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
