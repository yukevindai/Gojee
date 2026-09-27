# LocalPulse Setup Guide

## 1. Supabase Setup

### Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: LocalPulse
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your users
4. Wait for project to be created (~2 minutes)

### Get Your Supabase Credentials

1. In your Supabase dashboard, click on your project
2. Go to **Settings** (gear icon) → **API**
3. Copy these values:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Set Up Authentication (Optional for now)

1. Go to **Authentication** → **Providers**
2. Enable providers you want (Email, Google, etc.)
3. For Email auth:
   - Enable "Enable Email Confirmations" if desired
   - Configure email templates

## 2. Google Maps API Setup

### Enable Google Maps APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
   - **Geolocation API**

### Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. Copy the API key
4. Click **Edit API Key** to restrict it:
   - **Application restrictions**:
     - For development: None
     - For production: HTTP referrers (add your domain)
   - **API restrictions**:
     - Restrict key
     - Select: Maps JavaScript API, Places API, Geocoding API, Geolocation API

### Important: Billing Setup

Google Maps requires billing to be enabled (has generous free tier):
- Go to **Billing** in Google Cloud Console
- Enable billing for your project
- You get $200 free credit per month

## 3. Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_key_here
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

3. **Important**: Never commit `.env.local` to git (it's already in `.gitignore`)

## 4. Database Schema (Future)

When you're ready to store user data:

```sql
-- Create users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create plans table
create table public.plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  dining_spot jsonb,
  activity jsonb,
  filters jsonb,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.plans enable row level security;

-- Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can view their own plans"
  on public.plans for select
  using (auth.uid() = user_id);
```

## 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 6. Testing the Setup

1. Go to `/explore` page
2. Select some filters
3. Click "Confirm & GrassMax"
4. Check browser console for API calls
5. Verify Places API results are returned

## Troubleshooting

### Google Maps not loading
- Check API key is correct in `.env.local`
- Verify billing is enabled in Google Cloud
- Check browser console for specific errors

### Supabase connection issues
- Verify URL and anon key are correct
- Check project is not paused (free tier pauses after 1 week inactivity)
- Test connection in Supabase dashboard

### Environment variables not working
- Restart dev server after changing `.env.local`
- Make sure variables start with `NEXT_PUBLIC_` for client-side access
- Check file is named `.env.local` exactly (not `.env` or `.env.development`)
