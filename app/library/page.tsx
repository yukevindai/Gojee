'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Star, Heart, ChevronLeft } from 'lucide-react';
import { getSavedPlans, unsavePlan, type SavedPlan } from '@/lib/savedPlans';
import { getSavedLocations, unsaveLocation, type SavedLocation } from '@/lib/savedLocations';

type Tab = 'plans' | 'places';

export default function LibraryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('plans');
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [locationFilter, setLocationFilter] = useState<'all' | 'restaurant' | 'activity' | 'park' | 'cafe'>('all');

  useEffect(() => {
    // Load saved plans and locations
    loadSavedData();
  }, []);

  const loadSavedData = () => {
    setSavedPlans(getSavedPlans());
    setSavedLocations(getSavedLocations());
  };

  const filteredLocations = savedLocations.filter(loc => {
    if (locationFilter === 'all') return true;
    return loc.category === locationFilter;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Plan action handlers
  const handleViewPlan = (savedPlanId: string) => {
    router.push(`/dashboard?savedPlan=${savedPlanId}&mode=view`);
  };

  const handleStartPlan = (savedPlanId: string) => {
    router.push(`/dashboard?savedPlan=${savedPlanId}&mode=start`);
  };

  const handleEditPlan = (savedPlanId: string) => {
    router.push(`/dashboard?savedPlan=${savedPlanId}&mode=edit`);
  };

  const handleUnsavePlan = (planId: string) => {
    if (unsavePlan(planId)) {
      loadSavedData();
    }
  };

  // Location action handlers
  const handleViewOnMap = (place: SavedLocation['place']) => {
    const params = new URLSearchParams({
      lat: place.location.lat.toString(),
      lng: place.location.lng.toString(),
      zoom: '16'
    });
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleUnsaveLocation = (placeId: string) => {
    if (unsaveLocation(placeId)) {
      loadSavedData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Saved</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-4">
            <button
              onClick={() => setActiveTab('plans')}
              className={`pb-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'plans'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Plans ({savedPlans.length})
            </button>
            <button
              onClick={() => setActiveTab('places')}
              className={`pb-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'places'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Places ({savedLocations.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'plans' && (
          <div className="space-y-4">
            {savedPlans.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Plans you save will appear here.</p>
              </div>
            ) : (
              savedPlans.map((savedPlan) => (
                <div
                  key={savedPlan.id}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">
                        {savedPlan.plan.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {savedPlan.plan.description}
                      </p>

                      {/* Stop icons */}
                      <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                        {savedPlan.plan.steps.map((step, idx) => (
                          <span key={idx}>
                            {step.type === 'dining' ? '🍽' : '🌳'}
                            {idx < savedPlan.plan.steps.length - 1 && <span className="mx-1">→</span>}
                          </span>
                        ))}
                        {savedPlan.plan.sideQuests && savedPlan.plan.sideQuests.length > 0 && (
                          <span>→ {savedPlan.plan.sideQuests.length} optional</span>
                        )}
                      </div>

                      {savedPlan.areaName && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          {savedPlan.areaName}
                        </div>
                      )}

                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        Saved {formatDate(savedPlan.savedAt)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnsavePlan(savedPlan.plan.id)}
                      className="shrink-0 hover:scale-110 transition-transform"
                      aria-label="Unsave plan"
                    >
                      <Heart className="h-5 w-5 text-red-500 fill-current" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <button
                      onClick={() => handleViewPlan(savedPlan.id)}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2 px-4 text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleStartPlan(savedPlan.id)}
                      className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 rounded-lg py-2 px-4 text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Start
                    </button>
                    <button
                      onClick={() => handleEditPlan(savedPlan.id)}
                      className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 rounded-lg py-2 px-4 text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'places' && (
          <>
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {(['all', 'restaurant', 'activity', 'park', 'cafe'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLocationFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    locationFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  {filter !== 'all' && ` (${savedLocations.filter(l => l.category === filter).length})`}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredLocations.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {locationFilter === 'all'
                      ? 'Save places you want to try later.'
                      : `No ${locationFilter}s saved yet.`}
                  </p>
                </div>
              ) : (
                filteredLocations.map((savedLoc) => (
                  <div
                    key={savedLoc.id}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {savedLoc.place.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {savedLoc.place.address}
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                          {savedLoc.place.rating && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              {savedLoc.place.rating}
                            </div>
                          )}
                          <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded-full">
                            {savedLoc.category}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnsaveLocation(savedLoc.place.id)}
                        className="shrink-0 hover:scale-110 transition-transform"
                        aria-label="Unsave location"
                      >
                        <Heart className="h-5 w-5 text-red-500 fill-current" />
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        onClick={() => handleViewOnMap(savedLoc.place)}
                        className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 rounded-lg py-2 px-3 text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        View on map
                      </button>
                      <button
                        disabled
                        className="flex items-center justify-center gap-2 bg-gray-50 text-gray-400 rounded-lg py-2 px-3 text-sm font-medium cursor-not-allowed"
                        title="Coming soon"
                      >
                        Add to plan
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
