'use client';

import type { UserPreferences } from './cuisines';

const PREFERENCES_KEY = 'grassmaxxing_user_preferences';
const ONBOARDING_KEY = 'grassmaxxing_onboarding_complete';

export function getUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return { cuisines: [], dietary: [] };
  }

  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading user preferences:', error);
  }

  return { cuisines: [], dietary: [] };
}

export function saveUserPreferences(preferences: UserPreferences): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
}

export function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch (error) {
    return false;
  }
}

export function setOnboardingComplete(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (error) {
    console.error('Error saving onboarding status:', error);
  }
}
