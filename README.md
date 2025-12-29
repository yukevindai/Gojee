# GrassMaxxing

**Touching grass made simple** - Discover amazing places, connect with nature, and make the most of your outdoor experiences.

## Features

- **Interactive Landing Page**: Modern hero section with animated iPhone mockup showcasing the app experience
- **Smart Dashboard**: Full-screen Google Maps integration with intelligent filtering
- **Advanced Filters**: Party size, dining preferences, and hangout vibes
- **QuickKey Actions**: Pre-configured shortcuts for common activities
- **Multi-language Support**: Language selector with support for multiple languages

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Google Maps (@vis.gl/react-google-maps)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Utilities**: clsx

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager
- Google Maps API key (see setup below)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/laohei101/GrassMaxxing.git
cd GrassMaxxing
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Google Maps API key:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### Google Maps API Key Setup

To use the map functionality, you need a Google Maps API key:

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a new project** (or select an existing one)
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter a project name (e.g., "GrassMaxxing")
   - Click "Create"

3. **Enable required APIs**
   - Go to "APIs & Services" > "Library"
   - Search for and enable the following APIs:
     - **Maps JavaScript API**
     - **Places API** (optional, for future features)
     - **Geocoding API** (optional, for address lookups)

4. **Create API credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

5. **Restrict your API key** (recommended for production)
   - Click on the API key you just created
   - Under "Application restrictions":
     - Select "HTTP referrers (web sites)"
     - Add your domains:
       - `localhost:3000` (for development)
       - `yourdomain.com/*` (for production)
       - `*.vercel.app/*` (for Vercel deployments)
   - Under "API restrictions":
     - Select "Restrict key"
     - Choose "Maps JavaScript API"
   - Click "Save"

6. **Add the API key to your project**
   - Open `.env.local`
   - Replace `your_actual_api_key_here` with your API key

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
GrassMaxxing/
├── app/
│   ├── dashboard/          # Dashboard page with map
│   │   └── page.tsx
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/
│   ├── FilterDropdown.tsx  # Reusable filter component
│   ├── LanguageSelector.tsx # Language switcher
│   ├── PhoneMockup.tsx     # Animated phone demo
│   └── QuickKeyButton.tsx  # Quick action buttons
├── lib/                    # Utility functions
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
├── .env.local             # Environment variables (gitignored)
├── .env.example           # Environment template
└── README.md              # This file
```

## Available Scripts

### Development

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Building for Production

Before deploying, ensure the project builds successfully:

```bash
npm run build
```

This will:
- Type-check all TypeScript files
- Run ESLint
- Build the Next.js application
- Optimize assets and images
- Generate static pages where possible

If the build succeeds, you're ready to deploy!

## Deployment on Vercel

The easiest way to deploy GrassMaxxing is using [Vercel](https://vercel.com):

### Option 1: Deploy via Vercel Dashboard

1. **Push your code to GitHub**

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Import your repository in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository

3. **Configure environment variables**
   - In the deployment settings, add your environment variables:
     - Key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
     - Value: Your Google Maps API key
   - Click "Deploy"

4. **Update API key restrictions**
   - Go to Google Cloud Console
   - Update your API key restrictions to include your Vercel domain

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

### Environment Variables for Vercel

Make sure to add these environment variables in your Vercel project settings:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API key

## Features Overview

### Landing Page (`/`)

- Hero section with gradient text
- Animated iPhone mockup demonstrating app flow
- Typing animation showing search functionality
- Smooth transition to map view
- Features showcase
- Language selector
- CTA buttons for Sign Up and Sign In

### Dashboard (`/dashboard`)

- Full-screen Google Maps centered on user location
- **Top Filters**:
  - Party Size: Select group size (2-9+)
  - Dining: Multi-select meal types
  - Hangout: Choose atmosphere/vibe
- **QuickKey Buttons**: One-tap presets for common scenarios
- **Confirm Button**: Gradient animation when filters are active

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Map not showing

1. Check if API key is correctly set in `.env.local`
2. Verify the Maps JavaScript API is enabled in Google Cloud
3. Check browser console for API errors
4. Ensure API key restrictions allow your domain

### Build fails

1. Clear cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check for TypeScript errors: `npx tsc --noEmit`
4. Check for ESLint errors: `npm run lint`

### Location not detected

- Ensure HTTPS is enabled (required for geolocation)
- Check browser permissions for location access
- Location API may not work on `localhost` without user permission

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on [GitHub](https://github.com/laohei101/GrassMaxxing/issues).

---

Built with ❤️ using Next.js and Google Maps
