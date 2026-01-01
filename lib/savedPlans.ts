import type { Plan } from './planGenerator';

export interface SavedPlan {
  id: string;
  plan: Plan;
  savedAt: number; // timestamp
  areaName?: string; // e.g., "San Francisco", "Downtown Oakland"
}

const SAVED_PLANS_KEY = 'grassmaxxing_saved_plans';

export function getSavedPlans(): SavedPlan[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(SAVED_PLANS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading saved plans:', error);
  }

  return [];
}

export function savePlan(plan: Plan, areaName?: string): SavedPlan {
  const savedPlans = getSavedPlans();

  // Check if plan already saved (by ID)
  const existingIndex = savedPlans.findIndex(sp => sp.plan.id === plan.id);

  if (existingIndex !== -1) {
    // Update existing saved plan
    savedPlans[existingIndex] = {
      ...savedPlans[existingIndex],
      plan,
      savedAt: Date.now(),
      areaName,
    };
  } else {
    // Add new saved plan
    const newSavedPlan: SavedPlan = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      plan,
      savedAt: Date.now(),
      areaName,
    };
    savedPlans.unshift(newSavedPlan); // Add to beginning
  }

  try {
    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(savedPlans));
  } catch (error) {
    console.error('Error saving plan:', error);
  }

  return savedPlans[0];
}

export function unsavePlan(planId: string): boolean {
  const savedPlans = getSavedPlans();
  const filteredPlans = savedPlans.filter(sp => sp.plan.id !== planId);

  if (filteredPlans.length === savedPlans.length) {
    return false; // Plan not found
  }

  try {
    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(filteredPlans));
    return true;
  } catch (error) {
    console.error('Error unsaving plan:', error);
    return false;
  }
}

export function isPlanSaved(planId: string): boolean {
  const savedPlans = getSavedPlans();
  return savedPlans.some(sp => sp.plan.id === planId);
}

export function deleteSavedPlan(savedPlanId: string): boolean {
  const savedPlans = getSavedPlans();
  const filteredPlans = savedPlans.filter(sp => sp.id !== savedPlanId);

  if (filteredPlans.length === savedPlans.length) {
    return false; // Saved plan not found
  }

  try {
    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(filteredPlans));
    return true;
  } catch (error) {
    console.error('Error deleting saved plan:', error);
    return false;
  }
}
