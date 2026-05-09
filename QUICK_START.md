# Quick Start Guide - Zenith NEET AI App

Get your app deployed in 5 minutes! ⚡

## 1. Run Locally (1 minute)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 2. Deploy to Vercel (3 minutes)

### Option A: Easiest Way (Recommended)

1. Push to GitHub:
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Select your GitHub repo
5. Click "Deploy"

**Done!** Your app is live. Vercel gives you a URL like `https://your-app.vercel.app`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel

# For production
vercel --prod
```

### Option C: Docker (Advanced)

```bash
# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
EOF

# Build and run
docker build -t zenith-app .
docker run -p 3000:3000 zenith-app
```

## 3. Environment Setup (1 minute)

Create `.env.local`:
```env
NEXT_PUBLIC_APP_NAME=Zenith
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

On Vercel Dashboard:
- Settings → Environment Variables
- Add your variables
- Redeploy

## 4. Custom Domain (Optional)

On Vercel:
1. Settings → Domains
2. Add your domain
3. Update DNS settings
4. Done!

## What You Get

✅ **Performance**
- Global CDN
- Automatic image optimization
- Code splitting & bundling

✅ **Features**
- Automatic HTTPS/SSL
- 24/7 Monitoring
- Easy rollbacks
- Instant preview deployments

✅ **Scaling**
- Auto-scaling servers
- Unlimited bandwidth
- No configuration needed

## Project Structure

```
zenith-app/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   ├── globals.css        # Global styles
│   └── providers.tsx      # App providers
├── components/            # Reusable components
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── pages/             # Page components
├── public/                # Static files
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md
```

## Key Features

🎓 **Dashboard** - Track progress with stats and charts
📝 **Practice** - Interactive MCQ practice mode
📚 **Question Bank** - Browse 1000+ questions
📊 **Statistics** - Detailed performance analytics
⚙️ **Settings** - Personalization options

## Common Tasks

### Add a New Page

```tsx
// components/pages/NewPage.tsx
export default function NewPage() {
  return (
    <div className="p-8">
      <h1>New Page</h1>
    </div>
  )
}

// Then in app/page.tsx
// Add to renderPage() switch statement
case 'newpage':
  return <NewPage />
```

### Style with Tailwind

```tsx
<div className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700">
  <h1 className="text-2xl font-bold text-slate-50">Title</h1>
  <p className="text-slate-400">Description</p>
</div>
```

### Deploy Changes

```bash
# Make changes
git add .
git commit -m "Updated features"
git push origin main

# Vercel auto-deploys!
# Check deployment at vercel.com
```

## Troubleshooting

**App won't start locally?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Port 3000 already in use?**
```bash
npm run dev -- -p 3001
# Open http://localhost:3001
```

**Build fails on Vercel?**
1. Check build logs in Vercel Dashboard
2. Verify all environment variables are set
3. Try local build: `npm run build`

**404 on deployed app?**
- Clear Vercel cache: Settings → Deployment Protection → Clear All
- Redeploy

## Next Steps

1. ✅ Deploy to Vercel
2. 📝 Add your API backend
3. 🔐 Setup authentication
4. 💾 Connect to database
5. 📤 Setup file uploads
6. 📊 Add analytics
7. 🚀 Scale for millions of users

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Docs](https://react.dev)

## Support

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guides
- Read [README.md](./README.md) for full documentation
- Open GitHub issues for bugs/features

---

**You're all set!** Your production app is ready to serve millions of students. 🚀
