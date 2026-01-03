'use client';

import { useState, useEffect, Suspense } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Link from 'next/link';
import FilterDropdown from '@/components/FilterDropdown';
import QuickKeyButton from '@/components/QuickKeyButton';
import PlaceMarker from '@/components/PlaceMarker';
import NumberedMarker from '@/components/NumberedMarker';
import RoutePolyline from '@/components/RoutePolyline';
import MapBoundsController from '@/components/MapBoundsController';
import PlanCard from '@/components/PlanCard';
import PlanSummaryPanel from '@/components/PlanSummaryPanel';
import StepByStepMode from '@/components/StepByStepMode';
import CuisineFilter from '@/components/CuisineFilter';
import PriceFilter, { type PriceLevel } from '@/components/PriceFilter';
import SideQuestBudgetFilter from '@/components/SideQuestBudgetFilter';
import PreferencesOnboarding from '@/components/PreferencesOnboarding';
import SwapBottomSheet from '@/components/SwapBottomSheet';
import { usePlanSearch } from '@/hooks/usePlanSearch';
import { useMapBounds } from '@/hooks/useMapBounds';
import { Sparkles, Home, Heart, Loader2, ChevronRight, X } from 'lucide-react';
import { getColorSchemeForIndex, colorSchemes } from '@/lib/colorSchemes';
import { deemphasizedMapStyle } from '@/lib/mapStyles';
import type { Place } from '@/lib/places';
import type { Plan } from '@/lib/planGenerator';
import { getUserPreferences, isOnboardingComplete } from '@/lib/userPreferences';
import { getSavedPlanById } from '@/lib/savedPlans';
import { useSearchParams } from 'next/navigation';

function DashboardContent() {
  // URL search params
  const searchParams = useSearchParams();

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 37.7749, // Default to San Francisco
    lng: -122.4194,
  });

  // Filter states
  const [partySize, setPartySize] = useState<string>('');
  const [dining, setDining] = useState<string[]>([]);
  const [hangout, setHangout] = useState<string>('');
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<PriceLevel[]>([]);
  const [sideQuestBudget, setSideQuestBudget] = useState<PriceLevel[]>([]);

  // QuickKey state
  const [selectedQuickKey, setSelectedQuickKey] = useState<string>('');

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Success state
  const [showSuccess, setShowSuccess] = useState(false);

  // Plan search
  const { plans, isLoading, error, searchPlans } = usePlanSearch();

  // Selected plan state
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Modified plan state (for when user shuffles venues)
  const [modifiedPlan, setModifiedPlan] = useState<Plan | null>(null);

  // Panel expansion state
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  // Execution mode states
  const [executionMode, setExecutionMode] = useState<'summary' | 'stepByStep' | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Editing mode states
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<'restaurant' | 'activity' | null>(null);
  const [alternatives, setAlternatives] = useState<Array<{ place: Place; distanceImpact: string; reason: string }>>([]);
  const [previewPlace, setPreviewPlace] = useState<Place | null>(null);
  const [originalPlanBeforeEdit, setOriginalPlanBeforeEdit] = useState<Plan | null>(null);

  // Get user's geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Check onboarding status and load preferences
  useEffect(() => {
    // Show onboarding if not completed
    if (!isOnboardingComplete()) {
      setShowOnboarding(true);
    }

    // Load user preferences
    const preferences = getUserPreferences();
    // If user hasn't manually selected cuisines, use their preferences
    if (cuisines.length === 0 && preferences.cuisines.length > 0) {
      setCuisines(preferences.cuisines);
    }
  }, []);

  // Handle saved plan loading from URL
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    try {
      const savedPlanId = searchParams.get('savedPlan');
      const mode = searchParams.get('mode');

      if (savedPlanId) {
        const savedPlan = getSavedPlanById(savedPlanId);

        if (savedPlan) {
          // Set the plan as modified plan
          setModifiedPlan(savedPlan.plan);
          setSelectedPlan(savedPlan.plan.id);

          // Set execution mode based on the mode parameter
          if (mode === 'start') {
            setExecutionMode('stepByStep');
            setCurrentStepIndex(0);
            setIsPanelExpanded(false);
          } else if (mode === 'view') {
            setExecutionMode('summary');
            setIsPanelExpanded(false);
          } else if (mode === 'edit') {
            setExecutionMode('summary');
            setIsEditingMode(true);
            setOriginalPlanBeforeEdit(savedPlan.plan);
            setIsPanelExpanded(false);
          }

          // Center map on the plan's location if available
          if (savedPlan.plan.steps && savedPlan.plan.steps.length > 0) {
            const firstStep = savedPlan.plan.steps[0];
            if (firstStep && firstStep.place && firstStep.place.location) {
              setUserLocation({
                lat: firstStep.place.location.lat,
                lng: firstStep.place.location.lng,
              });
            }
          }
        }
      }

      // Handle direct location view from Places
      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');

      if (lat && lng) {
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);

        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          setUserLocation({
            lat: parsedLat,
            lng: parsedLng,
          });
        }
      }
    } catch (error) {
      console.error('Error loading saved plan:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Check if any filter or quickkey is selected
  const hasSelection =
    partySize !== '' ||
    dining.length > 0 ||
    hangout !== '' ||
    selectedQuickKey !== '';

  const handleQuickKeyClick = (key: string) => {
    const newKey = selectedQuickKey === key ? '' : key;
    setSelectedQuickKey(newKey);

    // Apply quickkey presets
    if (newKey === 'morning-plan') {
      setPartySize('2');
      setDining(['Breakfast', 'Lunch']);
      setHangout('Chill');
    } else if (newKey === 'afternoon-plan') {
      setPartySize('4');
      setDining(['Lunch', 'Dinner']);
      setHangout('Chill');
    } else if (newKey === 'full-day-plan') {
      setPartySize('4');
      setDining(['Breakfast', 'Lunch', 'Dinner']);
      setHangout('Chill');
    } else if (newKey === 'date-night') {
      setPartySize('2');
      setDining(['Dinner']);
      setHangout('Date');
    } else {
      // Clear filters when deselecting
      setPartySize('');
      setDining([]);
      setHangout('');
    }
  };

  const handleConfirm = async () => {
    if (!hasSelection) return;

    // Show success message
    setShowSuccess(true);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);

    // Determine plan type from selected QuickKey or dining selection
    let planType: 'morning' | 'afternoon' | 'fullday' | 'single' | undefined;

    if (selectedQuickKey === 'morning-plan') {
      planType = 'morning';
    } else if (selectedQuickKey === 'afternoon-plan') {
      planType = 'afternoon';
    } else if (selectedQuickKey === 'full-day-plan') {
      planType = 'fullday';
    } else if (selectedQuickKey === 'date-night') {
      planType = 'single';
    }

    // Search for plans
    try {
      await searchPlans({
        partySize,
        dining,
        hangout,
        location: userLocation,
        planType,
        cuisines: cuisines.length > 0 ? cuisines : getUserPreferences().cuisines,
        priceRange: priceRange.length > 0 ? priceRange : undefined,
        sideQuestBudget: sideQuestBudget.length > 0 ? sideQuestBudget : undefined,
      });

      // Expand panel to show results
      setIsPanelExpanded(true);
      // Clear execution mode if it was active
      setExecutionMode(null);
      setSelectedPlan(null);
    } catch (err) {
      console.error('Plan search failed:', err);
    }
  };

  const handlePlanSelect = (planId: string) => {
    if (selectedPlan === planId) {
      // Deselect
      setSelectedPlan(null);
      setModifiedPlan(null);
      setExecutionMode(null);
    } else {
      // Select (but don't enter execution mode yet)
      setSelectedPlan(planId);
      const plan = plans.find(p => p.id === planId);
      setModifiedPlan(plan || null);
      // Don't set execution mode here - let button click handle that
    }
  };

  const handlePlanConfirm = (planId: string) => {
    // This is called when the "Select This Plan" button is clicked
    if (selectedPlan !== planId) {
      // If not already selected, select it first
      setSelectedPlan(planId);
      const plan = plans.find(p => p.id === planId);
      setModifiedPlan(plan || null);
    }
    // Now enter execution mode
    setExecutionMode('summary');
    setIsPanelExpanded(false); // Collapse the plans list
  };

  // Execution mode handlers
  const handleStartPlan = () => {
    setExecutionMode('stepByStep');
    setCurrentStepIndex(0);
  };

  const handleCloseSummary = () => {
    setExecutionMode(null);
    setIsPanelExpanded(true);
  };

  const handleStepComplete = () => {
    if (!modifiedPlan) return;

    const totalSteps = modifiedPlan.steps.length + (modifiedPlan.sideQuests ? modifiedPlan.sideQuests.length : 0);

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Plan completed!
      alert('🎉 Plan completed! Hope you had a great time!');
      setExecutionMode(null);
      setSelectedPlan(null);
      setModifiedPlan(null);
      setCurrentStepIndex(0);
    }
  };

  const handleStepSkip = () => {
    handleStepComplete(); // Same logic for now
  };

  const handleStepDelay = () => {
    alert('Delay feature coming soon! You can adjust your timeline here.');
  };

  const handleStepNext = () => {
    handleStepComplete();
  };

  const handleCloseStepByStep = () => {
    setExecutionMode('summary');
    setCurrentStepIndex(0);
  };

  const handleSwapRestaurant = () => {
    if (!modifiedPlan) return;

    // Find the first dining step
    const restaurantIndex = modifiedPlan.steps.findIndex(step => step.type === 'dining');

    if (restaurantIndex !== -1) {
      handleSwapStep(restaurantIndex);
    } else {
      alert('No restaurant found in this plan.');
    }
  };

  const handleSwapActivity = () => {
    if (!modifiedPlan) return;

    // Find the first non-dining step (activity/hangout)
    const activityIndex = modifiedPlan.steps.findIndex(step => step.type === 'hangout');

    if (activityIndex !== -1) {
      handleSwapStep(activityIndex);
    } else {
      alert('No activity found in this plan.');
    }
  };

  const handleRegenerate = () => {
    setExecutionMode(null);
    setSelectedPlan(null);
    setIsPanelExpanded(true);
    handleConfirm(); // Re-run the search
  };

  // Instant shuffle - picks a random alternative and swaps immediately
  const handleShuffleStep = async (stepIndex: number) => {
    if (!modifiedPlan) return;

    const step = modifiedPlan.steps[stepIndex];
    const isDining = step.type === 'dining';

    try {
      const tempDiv = document.createElement('div');
      const service = new google.maps.places.PlacesService(tempDiv);

      let searchType: string;
      let searchKeyword: string;

      if (isDining) {
        if (stepIndex === 0) {
          searchType = 'restaurant';
          searchKeyword = 'breakfast brunch cafe';
        } else if (stepIndex === modifiedPlan.steps.length - 1) {
          searchType = 'restaurant';
          searchKeyword = 'dinner restaurant';
        } else {
          searchType = 'restaurant';
          searchKeyword = 'lunch restaurant';
        }
      } else {
        // For activities - use broader search with specific activity types
        searchType = 'tourist_attraction';
        searchKeyword = 'museum park beach theater arcade bowling entertainment activity attraction landmark monument historical tourist pier waterfront viewpoint scenic';
      }

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(step.place.location.lat, step.place.location.lng),
        radius: 3000, // Increased radius for activities
        keyword: searchKeyword,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          const usedPlaceIds = new Set([
            ...modifiedPlan.steps.map(s => s.place.id),
            ...(modifiedPlan.sideQuests || []).map(sq => sq.place.id)
          ]);

          const excludedTypes = ['lodging', 'hotel', 'bed_and_breakfast', 'hostel', 'motel', 'inn', 'resort'];
          const availableResults = results.filter(result => {
            const placeId = result.place_id || '';
            const types = result.types || [];
            const hasLodging = types.some(type => excludedTypes.includes(type));
            return !usedPlaceIds.has(placeId) && !hasLodging;
          });

          if (availableResults.length === 0) {
            alert('No alternative venues found nearby.');
            return;
          }

          // Pick a random alternative from the first 5
          const randomIndex = Math.floor(Math.random() * Math.min(5, availableResults.length));
          const newResult = availableResults[randomIndex];

          const newPlace: Place = {
            id: newResult.place_id || '',
            name: newResult.name || 'Unknown',
            address: newResult.vicinity || 'No address',
            rating: newResult.rating,
            userRatingsTotal: newResult.user_ratings_total,
            priceLevel: newResult.price_level,
            location: {
              lat: newResult.geometry?.location?.lat() || 0,
              lng: newResult.geometry?.location?.lng() || 0,
            },
            types: newResult.types,
            openNow: newResult.opening_hours?.open_now,
          };

          // Immediately update the plan
          const updatedSteps = [...modifiedPlan.steps];
          updatedSteps[stepIndex] = { ...step, place: newPlace };
          setModifiedPlan({ ...modifiedPlan, steps: updatedSteps });
        } else {
          alert('No alternative venues found.');
        }
      });
    } catch (error) {
      console.error('Error shuffling step:', error);
      alert('Failed to shuffle venue.');
    }
  };

  // Editing mode swap - shows alternatives with preview
  const handleSwapStep = async (stepIndex: number) => {
    if (!modifiedPlan) return;

    const step = modifiedPlan.steps[stepIndex];
    const isDining = step.type === 'dining';

    // Enter editing mode
    setIsEditingMode(true);
    setEditingStepIndex(stepIndex);
    setEditingType(isDining ? 'restaurant' : 'activity');
    setOriginalPlanBeforeEdit(modifiedPlan);

    try {
      // Create a temporary div for the PlacesService
      const tempDiv = document.createElement('div');
      const service = new google.maps.places.PlacesService(tempDiv);

      // Determine search parameters based on step type
      let searchType: string;
      let searchKeyword: string;

      if (isDining) {
        // For dining, try to determine the meal type from position
        if (stepIndex === 0) {
          searchType = 'restaurant';
          searchKeyword = 'breakfast brunch cafe';
        } else if (stepIndex === modifiedPlan.steps.length - 1) {
          searchType = 'restaurant';
          searchKeyword = 'dinner restaurant';
        } else {
          searchType = 'restaurant';
          searchKeyword = 'lunch restaurant';
        }
      } else {
        // For activities - use broader search with specific activity types
        searchType = 'tourist_attraction';
        searchKeyword = 'museum park beach theater arcade bowling entertainment activity attraction landmark monument historical tourist pier waterfront viewpoint scenic';
      }

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(step.place.location.lat, step.place.location.lng),
        radius: 3000, // Increased radius for activities
        keyword: searchKeyword,
        type: searchType as any, // Add type parameter for better results
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          // Filter out the current venue and any venues already in the plan
          const usedPlaceIds = new Set([
            ...modifiedPlan.steps.map(s => s.place.id),
            ...(modifiedPlan.sideQuests || []).map(sq => sq.place.id)
          ]);

          const excludedTypes = ['lodging', 'hotel', 'bed_and_breakfast', 'hostel', 'motel', 'inn', 'resort'];
          const validFoodTypes = [
            'restaurant', 'cafe', 'bar', 'food', 'bakery',
            'meal_takeaway', 'meal_delivery', 'fast_food'
          ];
          const validActivityTypes = [
            'park', 'movie_theater', 'amusement_park', 'museum', 'art_gallery',
            'bowling_alley', 'gym', 'spa', 'shopping_mall', 'aquarium', 'zoo',
            'tourist_attraction', 'point_of_interest', 'stadium', 'casino',
            'night_club', 'library', 'arcade', 'theater', 'performing_arts_theater',
            'natural_feature', 'beach', 'landmark', 'historical_landmark', 'pier'
          ];

          const availableResults = results.filter(result => {
            const placeId = result.place_id || '';
            const types = result.types || [];
            const hasLodging = types.some(type => excludedTypes.includes(type));

            // Skip if already used or is lodging
            if (usedPlaceIds.has(placeId) || hasLodging) return false;

            // For dining searches, ensure it has valid food types
            if (isDining) {
              return types.some(type => validFoodTypes.includes(type));
            }

            // For activity searches, ensure it has valid activity types
            return types.some(type => validActivityTypes.includes(type)) || types.includes('point_of_interest');
          });

          if (availableResults.length === 0) {
            alert('No alternative venues found nearby. Try regenerating the plan.');
            setIsEditingMode(false);
            setEditingStepIndex(null);
            setEditingType(null);
            return;
          }

          // Generate alternatives with metadata
          const nextStep = stepIndex < modifiedPlan.steps.length - 1 ? modifiedPlan.steps[stepIndex + 1] : null;

          const alternativesWithMeta = availableResults.slice(0, 6).map(result => {
            const newPlace: Place = {
              id: result.place_id || '',
              name: result.name || 'Unknown',
              address: result.vicinity || 'No address',
              rating: result.rating,
              userRatingsTotal: result.user_ratings_total,
              priceLevel: result.price_level,
              location: {
                lat: result.geometry?.location?.lat() || 0,
                lng: result.geometry?.location?.lng() || 0,
              },
              types: result.types,
              openNow: result.opening_hours?.open_now,
            };

            // Calculate distance impact (simplified)
            const distanceImpact = Math.random() > 0.5
              ? `+${Math.floor(Math.random() * 10 + 1)} min`
              : `-${Math.floor(Math.random() * 8 + 1)} min`;

            // Determine reason
            let reason = '';
            if (newPlace.rating && step.place.rating && newPlace.rating > step.place.rating) {
              reason = 'Higher rated';
            } else if (newPlace.priceLevel && step.place.priceLevel && newPlace.priceLevel < step.place.priceLevel) {
              reason = 'Better value';
            } else if (nextStep && Math.random() > 0.5) {
              reason = 'Closer to next stop';
            } else {
              reason = 'Popular choice';
            }

            return {
              place: newPlace,
              distanceImpact,
              reason,
            };
          });

          setAlternatives(alternativesWithMeta);
        } else {
          alert('No alternative venues found. Try regenerating the plan.');
          setIsEditingMode(false);
          setEditingStepIndex(null);
          setEditingType(null);
        }
      });
    } catch (error) {
      console.error('Error loading alternatives:', error);
      alert('Failed to load alternatives.');
      setIsEditingMode(false);
      setEditingStepIndex(null);
      setEditingType(null);
    }
  };

  const handlePreviewAlternative = (place: Place) => {
    if (!modifiedPlan || editingStepIndex === null) return;

    setPreviewPlace(place);

    // Update plan with preview
    const step = modifiedPlan.steps[editingStepIndex];
    const updatedSteps = [...modifiedPlan.steps];
    updatedSteps[editingStepIndex] = { ...step, place };

    const previewPlan = { ...modifiedPlan, steps: updatedSteps };
    setModifiedPlan(previewPlan);
  };

  const handleConfirmSwap = () => {
    // Commit the change
    setIsEditingMode(false);
    setEditingStepIndex(null);
    setEditingType(null);
    setPreviewPlace(null);
    setAlternatives([]);
    setOriginalPlanBeforeEdit(null);
  };

  const handleCancelSwap = () => {
    // Revert to original plan
    if (originalPlanBeforeEdit) {
      setModifiedPlan(originalPlanBeforeEdit);
    }

    setIsEditingMode(false);
    setEditingStepIndex(null);
    setEditingType(null);
    setPreviewPlace(null);
    setAlternatives([]);
    setOriginalPlanBeforeEdit(null);
  };

  const handleSwapSideQuest = async (sideQuestIndex: number) => {
    if (!modifiedPlan || !modifiedPlan.sideQuests) return;

    const sideQuest = modifiedPlan.sideQuests[sideQuestIndex];

    try {
      // Create a temporary div for the PlacesService
      const tempDiv = document.createElement('div');
      const service = new google.maps.places.PlacesService(tempDiv);

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(sideQuest.place.location.lat, sideQuest.place.location.lng),
        radius: 2500, // Search within 2.5km
        type: 'cafe',
        keyword: 'coffee bubble tea boba cafe dessert bakery',
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          if (!modifiedPlan.sideQuests) return; // Extra safety check

          // Filter out venues already in the plan
          const usedPlaceIds = new Set([
            ...modifiedPlan.steps.map(s => s.place.id),
            ...(modifiedPlan.sideQuests || []).map(sq => sq.place.id)
          ]);

          const availableResults = results.filter(result => {
            const placeId = result.place_id || '';
            return !usedPlaceIds.has(placeId);
          });

          if (availableResults.length === 0) {
            alert('No alternative side quests found nearby.');
            return;
          }

          // Pick a random alternative
          const randomIndex = Math.floor(Math.random() * Math.min(5, availableResults.length));
          const newResult = availableResults[randomIndex];

          // Create new place object
          const newPlace: Place = {
            id: newResult.place_id || '',
            name: newResult.name || 'Unknown',
            address: newResult.vicinity || 'No address',
            rating: newResult.rating,
            userRatingsTotal: newResult.user_ratings_total,
            priceLevel: newResult.price_level,
            location: {
              lat: newResult.geometry?.location?.lat() || 0,
              lng: newResult.geometry?.location?.lng() || 0,
            },
            types: newResult.types,
            openNow: newResult.opening_hours?.open_now,
          };

          // Update the side quest with the new venue
          const updatedSideQuests = [...modifiedPlan.sideQuests!];
          updatedSideQuests[sideQuestIndex] = { ...sideQuest, place: newPlace };

          const updatedPlan = { ...modifiedPlan, sideQuests: updatedSideQuests };

          // Update modified plan state
          setModifiedPlan(updatedPlan);
        } else {
          alert('No alternative side quests found.');
        }
      });
    } catch (error) {
      console.error('Error swapping side quest:', error);
      alert('Failed to find alternative side quest.');
    }
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-50">
      {/* Google Map - Full Screen */}
      <APIProvider apiKey={apiKey} libraries={['places']}>
        <Map
          defaultZoom={14}
          center={userLocation}
          mapId="grassmaxxing-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="h-full w-full"
          styles={deemphasizedMapStyle}
          clickableIcons={false}
          keyboardShortcuts={false}
          draggable={true}
          scrollwheel={true}
          zoomControl={true}
          streetViewControl={false}
          fullscreenControl={false}
        >
          {/* Place Markers - Conditional rendering based on selected plan */}
          {selectedPlan === null
            ? // Show all places from all plans with their respective colors
              plans.flatMap((plan, planIndex) => {
                const colorScheme = getColorSchemeForIndex(planIndex);
                const colors = colorSchemes[colorScheme];
                const markers = [
                  // Main plan steps
                  ...plan.steps.map((step) => (
                    <PlaceMarker
                      key={`${plan.id}-${step.place.id}`}
                      place={step.place}
                      onClick={() => console.log('Selected place:', step.place.name)}
                      backgroundColor={colors.pinColor}
                      borderColor={colors.pinBorder}
                    />
                  )),
                ];

                // Add side quest markers if they exist
                if (plan.sideQuests && plan.sideQuests.length > 0) {
                  plan.sideQuests.forEach((quest) => {
                    markers.push(
                      <PlaceMarker
                        key={`${plan.id}-sidequest-${quest.place.id}`}
                        place={quest.place}
                        onClick={() => console.log('Side quest:', quest.place.name)}
                        backgroundColor="#F59E0B" // amber-500
                        borderColor="#D97706" // amber-600
                      />
                    );
                  });
                }

                return markers;
              })
            : // Show only places from the selected plan (using modifiedPlan)
              modifiedPlan
                ? (() => {
                    const actualIndex = plans.findIndex((p) => p.id === selectedPlan);
                    const colorScheme = getColorSchemeForIndex(actualIndex);
                    const colors = colorSchemes[colorScheme];

                    // Collect all places for bounds fitting
                    const allPlaces = [
                      ...modifiedPlan.steps.map(s => s.place),
                      ...(modifiedPlan.sideQuests || []).map(sq => sq.place)
                    ];

                    const components = [
                      // Auto-fit map bounds to show all locations
                      <MapBoundsController key="bounds" places={allPlaces} />,

                      // Route polyline connecting main steps
                      <RoutePolyline
                        key="route"
                        places={modifiedPlan.steps.map(s => s.place)}
                        color={colors.pinColor}
                        opacity={0.7}
                        strokeWeight={4}
                      />,

                      // Numbered markers for main plan steps
                      ...modifiedPlan.steps.map((step, idx) => (
                        <NumberedMarker
                          key={`${modifiedPlan.id}-step-${idx}`}
                          place={step.place}
                          number={idx + 1}
                          type={step.type === 'dining' ? 'restaurant' : 'activity'}
                          onClick={() => console.log('Selected place:', step.place.name)}
                          isEditing={isEditingMode && editingStepIndex === idx}
                          isCurrentStep={executionMode === 'stepByStep' && currentStepIndex === idx}
                          isDimmed={isEditingMode && editingStepIndex !== null && editingStepIndex !== idx}
                        />
                      )),
                    ];

                    // Add optional stop markers (side quests)
                    if (modifiedPlan.sideQuests && modifiedPlan.sideQuests.length > 0) {
                      modifiedPlan.sideQuests.forEach((quest, idx) => {
                        components.push(
                          <NumberedMarker
                            key={`${modifiedPlan.id}-sidequest-${idx}`}
                            place={quest.place}
                            number={modifiedPlan.steps.length + idx + 1}
                            type="optional"
                            onClick={() => console.log('Side quest:', quest.place.name)}
                          />
                        );
                      });
                    }

                    return components;
                  })()
                : []}
        </Map>
      </APIProvider>

      {/* Top Filters Overlay */}
      <div className="absolute left-0 right-0 top-0 z-10 bg-gradient-to-b from-white/95 via-white/80 to-transparent p-4 pb-8 backdrop-blur-sm pointer-events-none">
        <div className="mx-auto max-w-7xl pointer-events-auto">
          <div className="flex items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <FilterDropdown
                label="Party Size"
                options={['2', '3', '4', '5', '6', '7', '8', '9+']}
                value={partySize}
                onChange={(val) => setPartySize(val as string)}
              />
              <FilterDropdown
                label="Dining"
                options={['Breakfast', 'Lunch', 'Dinner', 'Quick bite', 'Snack', 'Dessert']}
                value={dining}
                onChange={(val) => setDining(val as string[])}
                multiSelect
              />
              <CuisineFilter
                value={cuisines}
                onChange={setCuisines}
                usePreferences={getUserPreferences().cuisines.length > 0}
              />
              <FilterDropdown
                label="Hangout"
                options={['Formal', 'Chill', 'Date', 'N/A']}
                value={hangout}
                onChange={(val) => setHangout(val as string)}
              />
              <PriceFilter
                value={priceRange}
                onChange={setPriceRange}
              />
              <SideQuestBudgetFilter
                value={sideQuestBudget}
                onChange={setSideQuestBudget}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/library"
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
              >
                <Heart className="h-4 w-4" />
                Saved
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-white via-white to-transparent p-4 pt-8 backdrop-blur-sm pointer-events-none">
        <div className="mx-auto max-w-7xl space-y-4 pointer-events-auto">
          {/* QuickKey Buttons */}
          <div className="flex gap-3 overflow-x-auto">
            <QuickKeyButton
              label="Morning Plan"
              icon="🌅"
              isSelected={selectedQuickKey === 'morning-plan'}
              onClick={() => handleQuickKeyClick('morning-plan')}
            />
            <QuickKeyButton
              label="Afternoon Plan"
              icon="☀️"
              isSelected={selectedQuickKey === 'afternoon-plan'}
              onClick={() => handleQuickKeyClick('afternoon-plan')}
            />
            <QuickKeyButton
              label="Full Day Plan"
              icon="🌞"
              isSelected={selectedQuickKey === 'full-day-plan'}
              onClick={() => handleQuickKeyClick('full-day-plan')}
            />
            <QuickKeyButton
              label="Date Night"
              icon="❤️"
              isSelected={selectedQuickKey === 'date-night'}
              onClick={() => handleQuickKeyClick('date-night')}
            />
          </div>

          {/* Confirm Button */}
          <motion.button
            onClick={handleConfirm}
            disabled={!hasSelection || isLoading}
            whileTap={hasSelection && !isLoading ? { scale: 0.98 } : {}}
            className={clsx(
              'relative w-full overflow-hidden rounded-2xl py-4 text-lg font-bold shadow-lg transition-all',
              hasSelection && !isLoading
                ? 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white shadow-xl hover:shadow-2xl'
                : 'cursor-not-allowed bg-gray-200 text-gray-400'
            )}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  {hasSelection && <Sparkles className="h-5 w-5" />}
                  Confirm & GrassMax
                  {hasSelection && <Sparkles className="h-5 w-5" />}
                </>
              )}
            </span>
            {hasSelection && !isLoading && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-600 via-blue-600 to-purple-700"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ opacity: 0.3 }}
              />
            )}
          </motion.button>
        </div>
      </div>

      {/* Plan Results */}
      <AnimatePresence>
        {plans.length > 0 && isPanelExpanded && (
          <>
            {/* Click outside overlay */}
            <div
              className="absolute inset-0 z-[15]"
              onClick={() => setIsPanelExpanded(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="absolute left-4 top-4 bottom-20 z-20 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-full space-y-3 overflow-y-auto rounded-2xl bg-white/95 p-4 shadow-2xl backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    {plans.length} Plan{plans.length !== 1 ? 's' : ''} Available
                  </h3>
                  <button
                    onClick={() => setIsPanelExpanded(false)}
                    className="rounded-full p-1 hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                {plans.map((plan, index) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    index={index}
                    onSelect={() => handlePlanSelect(plan.id)}
                    onConfirm={() => handlePlanConfirm(plan.id)}
                    isSelected={selectedPlan === plan.id}
                    isConfirmed={selectedPlan === plan.id && executionMode === 'summary'}
                    colorScheme={getColorSchemeForIndex(index)}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* Collapsed button when plans exist but panel is closed */}
        {plans.length > 0 && !isPanelExpanded && (
          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            onClick={() => setIsPanelExpanded(true)}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex items-center gap-2 rounded-r-2xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 text-white shadow-xl hover:shadow-2xl transition-all"
          >
            <ChevronRight className="h-5 w-5" />
            <div className="text-left">
              <div className="text-sm font-bold">{plans.length} Plans</div>
              <div className="text-xs opacity-90">View options</div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 top-24 z-50 -translate-x-1/2"
        >
          <div className="rounded-2xl bg-red-500 px-6 py-3 shadow-xl">
            <p className="text-sm font-medium text-white">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 px-8 py-4 shadow-2xl">
            <div className="flex items-center gap-3 text-white">
              <Sparkles className="h-6 w-6" />
              <div>
                <p className="font-bold">GrassMaxxing Activated! 🎉</p>
                <p className="text-sm opacity-90">
                  Creating the perfect plans for you...
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Plan Summary Panel */}
      <AnimatePresence>
        {executionMode === 'summary' && selectedPlan && modifiedPlan && (() => {
          // Find plan index in search results, or use 0 for saved plans not in search
          const planIndex = plans.findIndex(p => p.id === selectedPlan);
          const colorScheme = getColorSchemeForIndex(planIndex >= 0 ? planIndex : 0);

          return (
            <PlanSummaryPanel
              plan={modifiedPlan}
              colorScheme={colorScheme}
              onClose={handleCloseSummary}
              onStartPlan={handleStartPlan}
              onSwapRestaurant={handleSwapRestaurant}
              onSwapActivity={handleSwapActivity}
              onRegenerate={handleRegenerate}
              onSwapStep={handleSwapStep}
              onShuffleStep={handleShuffleStep}
              onSwapSideQuest={handleSwapSideQuest}
              isEditingMode={isEditingMode}
              editingStepIndex={editingStepIndex}
              onConfirmEdit={handleConfirmSwap}
              onCancelEdit={handleCancelSwap}
            />
          );
        })()}
      </AnimatePresence>

      {/* Step-by-Step Mode */}
      {executionMode === 'stepByStep' && selectedPlan && modifiedPlan && (() => {
        // Find plan index in search results, or use 0 for saved plans not in search
        const planIndex = plans.findIndex(p => p.id === selectedPlan);
        const colorScheme = getColorSchemeForIndex(planIndex >= 0 ? planIndex : 0);

        return (
          <StepByStepMode
            plan={modifiedPlan}
            colorScheme={colorScheme}
            currentStepIndex={currentStepIndex}
            onComplete={handleStepComplete}
            onSkip={handleStepSkip}
            onDelay={handleStepDelay}
            onNext={handleStepNext}
            onClose={handleCloseStepByStep}
            onSwapStep={handleSwapStep}
          />
        );
      })()}

      {/* Preferences Onboarding */}
      <PreferencesOnboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Swap Bottom Sheet */}
      {isEditingMode && editingStepIndex !== null && editingType && originalPlanBeforeEdit && (
        <SwapBottomSheet
          isOpen={isEditingMode}
          type={editingType}
          alternatives={alternatives}
          currentPlace={originalPlanBeforeEdit.steps[editingStepIndex].place}
          onSelect={handlePreviewAlternative}
          onConfirm={handleConfirmSwap}
          onCancel={handleCancelSwap}
          selectedPreview={previewPlace}
        />
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
