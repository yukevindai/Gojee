# Vercel Deployment Fix

## Problem

Vercel is building the wrong directory (`post-exam-planner` instead of `localpulse`), causing this error:

```
error during build:
Could not resolve entry module "index.html".
```

This happens because:
- The repository has multiple apps (`post-exam-planner` and `localpulse`)
- Vercel defaults to the first package.json it finds
- The Root Directory wasn't explicitly set to `localpulse`

## Solution: Set Root Directory in Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your **LocalPulse** project
3. Go to **Settings** tab
4. Click **General** in the sidebar
5. Scroll to **Root Directory**
6. Click **Edit**
7. Enter: `localpulse`
8. Click **Save**
9. Go to **Deployments** tab
10. Click **⋯ (More)** on the latest deployment → **Redeploy**

### Method 2: When Creating New Project

If you're importing the project for the first time:

1. Click **"Add New Project"** in Vercel
2. Select `laohei101/GrassMaxxing` repository
3. In the **Configure Project** section:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click **Edit** → Enter `localpulse` → **Continue**
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Environment Variables** section:
   - Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Add `NEXT_PUBLIC_SUPABASE_URL` (optional)
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional)

5. Click **Deploy**

## Verification

After redeploying, you should see:

✅ **Build logs show:**
```bash
Running "npm run build"
> localpulse@0.1.0 build
> next build

Creating an optimized production build...
✓ Compiled successfully
```

✅ **No mention of:**
- `vite build`
- `post-exam-planner`
- `index.html`

## Repository Structure

```
GrassMaxxing/
├── post-exam-planner/    # Old Vite prototype (ignore)
├── localpulse/           # ← Deploy this! (Next.js app)
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── next.config.ts
├── vercel.json           # Root config (optimization)
└── CLAUDE.md
```

## Additional Configuration

I've created a `vercel.json` at the repository root that:
- Tells Vercel to only rebuild when `localpulse/` directory changes
- Prevents unnecessary rebuilds for changes to `post-exam-planner/`

This is an optimization and doesn't replace setting the Root Directory.

## Environment Variables Required

Make sure these are set in Vercel (Settings → Environment Variables):

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your Google Maps API key | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |

## Testing the Deployment

After successful deployment:

1. Visit your Vercel deployment URL
2. Click **"Get Started"** button
3. You should see the `/explore` page with filters
4. Try selecting filters (e.g., "Date Night" shortcut)
5. Click **"Confirm & GrassMax"**
6. Check browser console for API responses

## Troubleshooting

### Still seeing "vite build" error?
- Double-check Root Directory is set to `localpulse`
- Clear Vercel build cache: Settings → General → Clear Cache
- Redeploy from Deployments tab

### Build succeeds but app doesn't work?
- Check environment variables are set
- View Function logs in deployment dashboard
- Check browser console for client-side errors

### API returns "API key not configured"?
- Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set
- Make sure it's set for the correct environment
- Redeploy after adding env vars

## Support

- Vercel Documentation: https://vercel.com/docs/concepts/monorepos
- Vercel Support: https://vercel.com/support

---

**Quick Fix Summary:**
Settings → General → Root Directory → `localpulse` → Save → Redeploy ✅
