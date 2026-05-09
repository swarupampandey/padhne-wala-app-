# Deployment Guide - Zenith NEET AI Learning Platform

This guide will help you deploy your Zenith app to production environments.

## Table of Contents
1. [Local Setup](#local-setup)
2. [Deploy to Vercel (Recommended)](#deploy-to-vercel-recommended)
3. [Deploy to Other Platforms](#deploy-to-other-platforms)
4. [Environment Variables](#environment-variables)
5. [Troubleshooting](#troubleshooting)

---

## Local Setup

### Prerequisites
- Node.js 18.0 or higher
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/zenith-neet-app.git
cd zenith-neet-app

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
# or
bun install

# Create .env.local file (optional)
cp .env.local.example .env.local
```

### Running Locally

```bash
# Development server
npm run dev

# Open http://localhost:3000 in your browser

# Build for production
npm run build

# Start production server
npm start
```

---

## Deploy to Vercel (Recommended)

Vercel is optimized for Next.js and offers the easiest deployment experience.

### Option 1: Using Vercel Dashboard (Easiest)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. Go to [vercel.com](https://vercel.com)

3. Click "Add New..." → "Project"

4. Select your GitHub repository

5. Configure project settings:
   - Framework: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

6. Add environment variables if needed

7. Click "Deploy"

### Option 2: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd zenith-neet-app
vercel

# For production deployment
vercel --prod
```

### Option 3: Using GitHub Integration

1. Connect your GitHub account to Vercel
2. Create a `main` branch with your latest code
3. Every push to `main` automatically deploys
4. Every pull request gets a preview deployment

---

## Deploy to Other Platforms

### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Deploy
git push heroku main
```

### Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Set environment variables
5. Deploy

### Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select repository
5. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Add environment variables
7. Deploy

### AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize Amplify in project
amplify init

# Deploy
amplify publish
```

### Google Cloud Run

```bash
# Install Google Cloud SDK
# Then authenticate
gcloud auth login

# Build and push to Cloud Run
gcloud run deploy zenith-neet-app \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Environment Variables

### Create `.env.local` file

```env
# App configuration
NEXT_PUBLIC_APP_NAME=Zenith
NEXT_PUBLIC_APP_URL=https://your-domain.com

# API endpoints (when ready)
# NEXT_PUBLIC_API_URL=https://api.your-domain.com
# NEXT_PUBLIC_API_KEY=your_api_key_here
```

### Set in Vercel Dashboard

1. Go to Settings → Environment Variables
2. Add variables:
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_APP_URL`
   - Any API keys or tokens

3. Apply to environments:
   - Production
   - Preview
   - Development

---

## Production Checklist

Before deploying to production:

- [ ] Update `NEXT_PUBLIC_APP_URL` in environment variables
- [ ] Set proper `NEXT_PUBLIC_API_URL` if using backend
- [ ] Add API keys/tokens to environment variables
- [ ] Test locally with `npm run build && npm start`
- [ ] Review `.env.local` is in `.gitignore`
- [ ] Update metadata in `app/layout.tsx`
- [ ] Test all features on production URL
- [ ] Set up monitoring/analytics
- [ ] Configure custom domain (if applicable)
- [ ] Set up automated backups
- [ ] Review security headers

---

## Monitoring & Analytics

### Setup Analytics

Add to `app/layout.tsx`:

```tsx
// Google Analytics
<Script src="https://www.googletagmanager.com/gtag/js?id=GA_ID" />
<Script id="google-analytics">
  {`window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_ID');`}
</Script>
```

### Error Tracking

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Datadog for performance monitoring

---

## Domain Configuration

### Custom Domain on Vercel

1. Go to Settings → Domains
2. Add your domain
3. Update DNS records:
   - Add `CNAME` record pointing to Vercel
   - Or use nameservers provided by Vercel

### SSL/TLS Certificate

Vercel automatically provides free SSL certificates via Let's Encrypt.

---

## Performance Optimization

### Before Going Live

```bash
# Run Next.js analysis
npm run build -- --analyze

# Check bundle size
npm run build

# Test performance
npm run start
# Then open http://localhost:3000
# Use Chrome DevTools Lighthouse
```

### Optimization Tips

1. **Image Optimization**
   - Use Next.js Image component
   - Optimize all images

2. **Code Splitting**
   - Dynamic imports for large components
   - Already handled by Next.js

3. **Caching**
   - Configure cache headers
   - Use SWR for data fetching

4. **Database**
   - Setup database connection
   - Configure connection pooling

---

## Scaling

### As Traffic Grows

1. **Database**
   - Upgrade plan if needed
   - Consider read replicas

2. **Storage**
   - Use CDN for static files
   - Vercel integrates with Blob for file storage

3. **API**
   - Setup rate limiting
   - Monitor API performance

4. **Monitoring**
   - Setup alerts
   - Track key metrics

---

## Troubleshooting

### Build Fails on Vercel

**Problem**: `npm ERR! code ENOENT`

**Solution**:
```json
// vercel.json
{
  "buildCommand": "npm ci && npm run build",
  "installCommand": "npm ci"
}
```

### Environment Variables Not Loading

**Problem**: Variables not available in code

**Solution**:
- Prefix with `NEXT_PUBLIC_` for client-side
- Restart deployment after updating
- Check spelling matches exactly

### 404 Errors on Deploy

**Problem**: Pages not found

**Solution**:
- Ensure `app` directory structure is correct
- Check `tsconfig.json` paths
- Rebuild and redeploy

### Slow Performance

**Problem**: App loads slowly

**Solution**:
- Check bundle size: `npm run build`
- Use Lighthouse in DevTools
- Enable Vercel Analytics
- Optimize images
- Add caching headers

### Memory Issues

**Problem**: `Error: JavaScript heap out of memory`

**Solution**:
```json
// vercel.json
{
  "buildCommand": "NODE_OPTIONS=--max_old_space_size=3000 npm run build"
}
```

---

## Rollback

### Revert to Previous Deployment

**On Vercel**:
1. Go to Deployments
2. Click on previous deployment
3. Click "Promote to Production"

**Using Git**:
```bash
git revert <commit-hash>
git push origin main
```

---

## Support

- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- GitHub Issues: https://github.com/yourusername/zenith-neet-app/issues

---

## Success!

Your app is now live! 🎉

- Share your URL with users
- Monitor performance
- Gather feedback
- Iterate and improve

