# LocalPulse

> Touching grass made simple

A premium post-exam celebration planner that helps you discover and plan amazing local experiences. Built with Next.js, Tailwind CSS, and Framer Motion.

## Features

- 🗺️ Interactive map-based exploration
- 🎯 Smart filtering by party size, dining preferences, and hangout style
- ✨ AI-powered venue recommendations using Google Places API
- 💕 Date mode with romantic venue prioritization
- 📍 2km proximity guarantee between activities
- ⭐ 4.5+ star rating requirement
- 📱 Beautiful, responsive UI with smooth animations

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Backend**: Supabase
- **APIs**: Google Maps Platform (Places API, Geocoding, Maps JavaScript API)

## Getting Started

### Prerequisites

1. **Node.js** 18+ and npm
2. **Google Maps API Key** with billing enabled
3. **Supabase Account** (optional for now)

### Installation

1. Clone the repository:
   ```bash
   cd localpulse
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Edit `.env.local` with your API keys:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## API Setup

### Google Maps Platform

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Geolocation API
4. Create credentials → API Key
5. **Important**: Enable billing (free tier available with $200/month credit)
6. (Production) Restrict API key to your domain

### Supabase Setup

1. Go to [Supabase](https://app.supabase.com)
2. Create a new project
3. Get your project URL and anon key from Settings → API
4. (Optional) Set up authentication providers

See [SETUP.md](./SETUP.md) for detailed instructions.

## Project Structure

```
localpulse/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── explore/page.tsx          # Main map interface
│   ├── results/page.tsx          # Results display
│   ├── api/grassmax/route.ts     # GrassMax API logic
│   └── globals.css               # Global styles
├── components/
│   ├── FloatingPhone.tsx         # Animated phone demo
│   └── FilterDropdown.tsx        # Filter component
├── lib/
│   ├── types.ts                  # TypeScript types
│   └── supabase.ts               # Supabase client
├── .env.local                    # Environment variables (not in git)
└── SETUP.md                      # Setup instructions
```

## Deployment on Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/laohei101/GrassMaxxing&project-name=localpulse&root-directory=localpulse)

### Manual Deployment

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy from the localpulse directory:
   ```bash
   cd localpulse
   vercel
   ```

3. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? **localpulse**
   - In which directory is your code located? **.**
   - Want to override settings? **N**

4. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to **Environment Variables**
   - Add:
     - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. Redeploy to apply environment variables:
   ```bash
   vercel --prod
   ```

### Environment Variables for Vercel

In your Vercel project settings, add these environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps Platform API key | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Optional |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Optional |

**Important**: All variables starting with `NEXT_PUBLIC_` are exposed to the browser.

## How It Works

### GrassMax Algorithm

1. **User Input**: Select filters (party size, dining preferences, hangout style)
2. **Location Detection**: Get user's current location via browser geolocation
3. **Smart Query**:
   - Query Google Places for dining spots within 2km
   - Filter for 4.5+ star ratings
   - If "Date" mode: prioritize venues with romantic keywords in reviews
4. **Activity Matching**:
   - Find activities near the selected restaurant
   - Match activity type to hangout style
   - Ensure 4.5+ stars and within 2km
5. **Plan Generation**: Return complete itinerary with photos, reviews, and directions

### Date Mode Intelligence

When "Date" is selected, the algorithm:
- Scans restaurant reviews for keywords: "romantic", "intimate", "cozy", "ambiance", "candlelit"
- Prioritizes venues with positive romantic mentions
- Suggests date-friendly activities (parks, art galleries, wine bars)

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Troubleshooting

### Google Maps not loading
- Verify API key in `.env.local`
- Ensure billing is enabled in Google Cloud
- Check API restrictions in Google Cloud Console
- Look for errors in browser console

### "API key not configured" error
- Restart dev server after updating `.env.local`
- Verify variable name starts with `NEXT_PUBLIC_`
- Check `.env.local` is in the correct directory

### No results found
- Check your location permissions
- Verify you're in an area with restaurants/activities
- Try different filter combinations
- Check Google Places API quotas in Cloud Console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Check [SETUP.md](./SETUP.md) for detailed setup instructions
- Review [troubleshooting](#troubleshooting) section
- Open an issue on GitHub

---

Built with ❤️ by the LocalPulse team
