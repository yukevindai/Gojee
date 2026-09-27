# LocalPulse - Vercel Deployment Guide

This guide will help you deploy LocalPulse to Vercel for preview and production.

## Prerequisites

- GitHub account with push access to the repository
- Vercel account (sign up at https://vercel.com)
- Google Maps API key
- Supabase credentials (optional)

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to GitHub

Make sure all your changes are committed and pushed:

```bash
cd /home/user/GrassMaxxing
git add localpulse/
git commit -m "Prepare for Vercel deployment"
git push origin claude/post-exam-planner-ui-HSg75
```

### Step 2: Import Project in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `laohei101/GrassMaxxing`
4. Configure project:
   - **Project Name**: `localpulse`
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `localpulse` ⚠️ **IMPORTANT**
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### Step 3: Add Environment Variables

In the Vercel project settings, add these environment variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your Google Maps API key | Required for Places API |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Optional for now |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Optional for now |

**How to add:**
1. In Vercel dashboard, go to your project
2. Click **Settings** tab
3. Click **Environment Variables** in sidebar
4. Add each variable for **Production**, **Preview**, and **Development**
5. Click **Save**

### Step 4: Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (~2-3 minutes)
3. Vercel will provide you with:
   - **Production URL**: `https://localpulse.vercel.app` (or custom domain)
   - **Preview URL**: `https://localpulse-{hash}.vercel.app`

### Step 5: Verify Deployment

1. Visit your deployment URL
2. Test the explore page
3. Try a GrassMax search (make sure location permissions are enabled)
4. Check browser console for any errors

---

## Option 2: Deploy via Vercel CLI

### Step 1: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate via:
- Email
- GitHub
- GitLab
- Bitbucket

### Step 2: Deploy from Local

Navigate to the localpulse directory and deploy:

```bash
cd /home/user/GrassMaxxing/localpulse
vercel
```

Answer the prompts:
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N` (first time)
- **What's your project's name?** → `localpulse`
- **In which directory is your code located?** → `.` (current directory)
- **Want to modify settings?** → `N`

### Step 3: Add Environment Variables

After initial deployment, add environment variables:

```bash
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
# Paste your Google Maps API key when prompted
# Select: Production, Preview, Development

vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste your Supabase URL

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste your Supabase anon key
```

### Step 4: Deploy to Production

```bash
vercel --prod
```

This will create a production deployment with your environment variables.

---

## Post-Deployment Setup

### Google Maps API Restrictions

For security, restrict your Google Maps API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your API key
4. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Add your Vercel domains:
     ```
     https://localpulse.vercel.app/*
     https://localpulse-*.vercel.app/*
     https://yourdomain.com/*
     ```
5. Click **Save**

### Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (~24-48 hours)

---

## Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: For all other branches (e.g., `claude/post-exam-planner-ui-HSg75`)

Every commit triggers a new deployment!

---

## Monitoring & Debugging

### View Deployment Logs

1. Go to Vercel dashboard
2. Click on your project
3. Click on a deployment
4. View **Build Logs** and **Runtime Logs**

### Common Issues

**Build Failed**
- Check build logs in Vercel dashboard
- Verify all dependencies in package.json
- Ensure TypeScript types are correct

**API Key Not Working**
- Verify environment variables are set correctly
- Check variable names (must start with `NEXT_PUBLIC_`)
- Redeploy after adding env vars

**Google Maps Not Loading**
- Check API key has correct permissions
- Verify domain is whitelisted in Google Cloud Console
- Check browser console for errors

**404 on Routes**
- Ensure root directory is set to `localpulse` in Vercel
- Verify Next.js App Router structure

---

## Preview Deployment

Every time you push to a branch, Vercel creates a preview deployment:

```bash
git add .
git commit -m "New feature"
git push origin your-branch-name
```

Vercel will:
1. Automatically detect the push
2. Build your project
3. Deploy to a preview URL: `https://localpulse-git-{branch}-{user}.vercel.app`
4. Comment on GitHub PR (if applicable) with preview URL

---

## Rollback Deployment

If something goes wrong:

1. Go to Vercel dashboard
2. Click **Deployments** tab
3. Find a previous working deployment
4. Click **⋯ (More)** → **Promote to Production**

---

## Performance Optimization

Vercel automatically provides:
- ✅ Edge caching
- ✅ Image optimization
- ✅ Compression
- ✅ CDN distribution
- ✅ HTTPS/SSL

For additional optimization:
- Use Next.js Image component for images
- Enable ISR (Incremental Static Regeneration) where appropriate
- Implement caching strategies for API routes

---

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- LocalPulse Issues: https://github.com/laohei101/GrassMaxxing/issues

---

**Happy Deploying! 🚀**
