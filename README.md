# GrassMaxxing

**Touching grass made simple** — tell it who you're with, what you want to eat, and how you want to hang out, and it builds you a full day out on the map.

<a href="https://apps.apple.com/us/app/gojee/id6760603768">
  <img alt="Download on the App Store" src="https://img.shields.io/badge/Download-App%20Store-black?logo=apple&logoColor=white" />
</a>

---

## 📦 Project status: concluded

**This repository is complete and no longer under active development.**

GrassMaxxing started as a Next.js web prototype for automatic outing planning. That prototype did its job — it proved out the plan-generation engine, the filter model, and the step-by-step execution flow. It has now shipped as a native iOS app:

### 👉 [**Gojee on the App Store**](https://apps.apple.com/us/app/gojee/id6760603768)

Development has moved to **Xcode as a native iOS project**. Building directly against the iOS environment gives faster iteration, real device testing, and access to native maps, location, and system integrations that the web version could only approximate. This repo remains public as an archive of the original web implementation and a reference for the planning logic behind the app.

Issues and pull requests here are unlikely to be actioned. The code is left in a working state and is free to read, fork, and learn from under the Apache 2.0 license.

---

## What it does

You pick a few filters. It searches real venues around you, assembles multiple complete itineraries, and then walks you through the one you choose — stop by stop, with swaps if plans change.

## Features

### Plan generation
- **Four plan shapes** — Morning Plan, Afternoon Plan, Full Day Plan, and Date Night, each with its own meal/activity structure
- **Multiple plans at once** — generate 2–10 distinct itineraries per search, with venue diversity enforced so plans don't repeat the same restaurants
- **Side quests** — optional bonus stops layered onto plans, with their own independent budget filter
- **Time windows** — set a start and end time and plans are filtered to fit
- **Distance awareness** — every plan is categorized as walking, bussing, or driving based on the spread between venues
- **Cost & duration estimates** — each plan reports estimated price level ($–$$$$) and total time

### Weather-aware planning
- Live conditions from **Weather.gov** with **Open-Meteo** as fallback
- Plans shift toward indoor or outdoor venues based on current temperature and season
- Snow detection (today/yesterday) unlocks snow-specific side quests; winter gets its own set

### Filters
- Party size, dining types (breakfast / lunch / dinner / quick bite), hangout vibe (Chill / Formal / Date)
- **Cuisine preferences** and **dietary restrictions**, remembered across sessions
- **Price range** for dining, separate **side quest budget**
- Toggle activities on or off to get dining-only or activity-only plans

### Choosing and running a plan
- **Plan cards** with color-coded schemes, route polylines, and numbered map markers
- **Spinning wheel** — can't decide? Spin to pick one of your generated plans at random
- **Step-by-step mode** — run the plan live: complete, skip, or delay each stop, with directions, ratings, and contact info per venue
- **Swap sheet** — replace any stop mid-plan with ranked alternatives showing the distance impact of each swap

### Saving
- **Library** page for saved plans and saved places, filterable by category (restaurant, activity, park, cafe)
- Saved plans can be re-viewed, edited, or started directly from the library
- **Preferences onboarding** captures cuisine and dietary choices on first run

> **Note:** the sign-in and sign-up screens are UI only — there is no auth backend. All plans, places, and preferences persist to `localStorage` in the browser.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Maps & venues**: Google Maps + Places API (`@vis.gl/react-google-maps`)
- **Weather**: Weather.gov API, Open-Meteo API
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Maps API key with **Maps JavaScript API** and **Places API** enabled

### Installation

```bash
git clone https://github.com/yukevindai/GrassMaxxing.git
cd GrassMaxxing
npm install
cp .env.example .env.local
```

Then edit `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### Google Maps API key setup

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. Under **APIs & Services → Library**, enable:
   - **Maps JavaScript API** (required — renders the map)
   - **Places API** (required — searches restaurants and venues)
   - **Geocoding API** (optional)
3. Under **APIs & Services → Credentials**, click **Create Credentials → API Key** and copy it.
4. Restrict the key (recommended): set **Application restrictions** to HTTP referrers (`localhost:3000`, your production domain, `*.vercel.app/*`), and **API restrictions** to the two required APIs above.
5. Paste the key into `.env.local`.

No API key is needed for weather — both weather providers are public and unauthenticated.

### Running

```bash
npm run dev     # start the dev server at http://localhost:3000
npm run build   # production build (type-checks and lints)
npm run start   # serve the production build
npm run lint    # ESLint
```

## Project Structure

```
GrassMaxxing/
├── app/
│   ├── page.tsx              # Landing page with animated phone mockup
│   ├── dashboard/page.tsx    # Main map, filters, plan generation & execution
│   ├── library/page.tsx      # Saved plans and saved places
│   ├── signin/, signup/      # Auth screens (UI only)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── PlanCard.tsx          # Generated plan summary card
│   ├── PlanSummaryPanel.tsx  # Bottom panel listing generated plans
│   ├── StepByStepMode.tsx    # Live stop-by-stop plan execution
│   ├── SwapBottomSheet.tsx   # Alternative venue picker with distance impact
│   ├── SpinningWheel.tsx     # Random plan selector
│   ├── PreferencesOnboarding.tsx
│   ├── CuisineFilter.tsx, PriceFilter.tsx, SideQuestBudgetFilter.tsx
│   ├── FilterDropdown.tsx, QuickKeyButton.tsx
│   ├── PlaceCard.tsx, PlaceMarker.tsx, NumberedMarker.tsx
│   ├── RoutePolyline.tsx, MapBoundsController.tsx
│   ├── PhoneMockup.tsx, LanguageSelector.tsx, PriceIndicator.tsx
├── lib/
│   ├── planGenerator.ts      # Core itinerary engine (all four plan shapes)
│   ├── places.ts             # Place types and Places API search mapping
│   ├── weather.ts            # Season/temperature logic, indoor-outdoor rules
│   ├── weatherApi.ts         # Weather.gov + Open-Meteo clients
│   ├── cuisines.ts, userPreferences.ts
│   ├── savedPlans.ts, savedLocations.ts
│   ├── colorSchemes.ts, mapStyles.ts
├── hooks/
│   ├── usePlanSearch.ts      # Orchestrates multi-category venue search
│   ├── usePlacesSearch.ts, useMapBounds.ts
└── public/
```

## Deployment

The web version deploys to [Vercel](https://vercel.com) with no extra configuration:

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` under environment variables.
3. Deploy, then add your Vercel domain to the API key's referrer restrictions in Google Cloud Console.

Or via CLI: `npm i -g vercel && vercel`.

## Troubleshooting

**Map not showing** — confirm the key is in `.env.local`, that Maps JavaScript API is enabled, and that the key's referrer restrictions allow your domain. Check the browser console for API errors.

**Places search not working** — confirm Places API is enabled and included in the key's API restrictions. Newly enabled APIs can take a few minutes to propagate. Common console errors:
- *"This API project is not authorized to use this API"* → enable Places API
- *"API keys with referer restrictions cannot be used"* → update the key's restrictions
- *"You have exceeded your request quota"* → check usage limits in Google Cloud Console

**Location not detected** — geolocation requires HTTPS (or `localhost`) and browser permission.

**Build fails** — clear `.next`, reinstall `node_modules`, then run `npx tsc --noEmit` and `npm run lint` to surface the actual error.

## Browser Support

Latest versions of Chrome, Firefox, Safari, and Edge.

## Contributing

This project is concluded and no longer accepting contributions. Forks are welcome — the plan generation logic in `lib/planGenerator.ts` is self-contained and portable.

## License

Licensed under the [Apache License 2.0](LICENSE).

---

Built with Next.js and Google Maps. Now living on iOS as [**Gojee**](https://apps.apple.com/us/app/gojee/id6760603768).
