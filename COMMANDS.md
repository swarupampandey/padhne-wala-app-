# Command Reference - Zenith NEET App

Copy-paste ready commands for all common tasks.

## Development

### Start Development Server
```bash
npm run dev
```
Open http://localhost:3000

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code (if configured)
```bash
npm run lint
```

---

## Installation & Setup

### First Time Setup
```bash
# Clone repo
git clone https://github.com/yourusername/zenith-neet-app.git
cd zenith-neet-app

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Start development
npm run dev
```

### Install with PNPM (Faster)
```bash
npm install -g pnpm
pnpm install
pnpm dev
```

### Install with Yarn
```bash
npm install -g yarn
yarn install
yarn dev
```

### Install with Bun (Fastest)
```bash
npm install -g bun
bun install
bun run dev
```

---

## Git & GitHub

### Initial Setup
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: NEET learning platform"

# Add GitHub remote
git remote add origin https://github.com/yourusername/zenith-neet-app.git

# Create main branch and push
git branch -M main
git push -u origin main
```

### Daily Workflow
```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Describe your changes"

# Push to GitHub
git push origin main
```

### Create a Feature Branch
```bash
# Create new branch
git checkout -b feature/new-feature

# Make changes...

# Commit
git commit -m "Add new feature"

# Push branch
git push -u origin feature/new-feature

# Create pull request on GitHub
```

---

## Deployment to Vercel

### Option 1: Using Vercel CLI
```bash
# Install Vercel CLI (one time)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Check status
vercel status

# View logs
vercel logs
```

### Option 2: GitHub Integration (Automatic)
```bash
# Push to GitHub
git push origin main

# Vercel automatically deploys!
# No additional commands needed
```

### Option 3: Docker Deployment
```bash
# Build Docker image
docker build -t zenith-app .

# Run locally
docker run -p 3000:3000 zenith-app

# Push to registry (if using cloud)
docker tag zenith-app:latest username/zenith-app:latest
docker push username/zenith-app:latest
```

---

## Environment Variables

### Create Local File
```bash
# Create environment file
touch .env.local

# Edit it (use your editor)
code .env.local
# or
nano .env.local
# or
vim .env.local
```

### Content
```env
NEXT_PUBLIC_APP_NAME=Zenith
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### For Production on Vercel
```bash
# Using Vercel CLI
vercel env add NEXT_PUBLIC_APP_NAME Zenith
vercel env add NEXT_PUBLIC_APP_URL https://your-app.vercel.app

# Then redeploy
vercel --prod
```

---

## Database Setup (When Ready)

### Supabase
```bash
# Create project at supabase.com
# Get connection string from project settings

# Add to .env.local
echo 'DATABASE_URL=postgresql://...' >> .env.local

# Install Supabase client
npm install @supabase/supabase-js
```

### Neon
```bash
# Create project at neon.tech
# Get connection string

# Add to .env.local
echo 'DATABASE_URL=postgresql://...' >> .env.local

# Install database client
npm install pg
```

### MongoDB
```bash
# Create project at mongodb.com
# Get connection string

# Add to .env.local
echo 'MONGODB_URI=mongodb+srv://...' >> .env.local

# Install MongoDB client
npm install mongodb
```

---

## Monitoring & Debugging

### Check Build Errors
```bash
# Build and see errors
npm run build

# Start with verbose logging
DEBUG=* npm run dev
```

### Check Port Usage
```bash
# Mac/Linux - Find what's using port 3000
lsof -i :3000

# Windows - Find what's using port 3000
netstat -ano | findstr :3000

# Kill process on port 3000 (Mac/Linux)
kill -9 <PID>
```

### View Logs Locally
```bash
# View Next.js build logs
npm run build 2>&1 | tee build.log

# View development logs
npm run dev > app.log 2>&1
```

### Vercel Logs
```bash
# View deployment logs
vercel logs

# View logs for specific deployment
vercel logs --since 1h
```

---

## Cleanup & Maintenance

### Delete Node Modules (Reinstall Fresh)
```bash
# Remove node_modules
rm -rf node_modules

# Remove lock file
rm package-lock.json

# Reinstall
npm install
```

### Clear Vercel Cache
```bash
# Using CLI
vercel env list
vercel link --project=your-project-name

# Then manually clear on dashboard:
# Settings → Deployment Protection → Clear All
```

### Clean Build Cache
```bash
# Remove Next.js cache
rm -rf .next

# Rebuild
npm run build
```

---

## Performance Testing

### Build Analysis
```bash
# Analyze bundle size
npm run build
# Look at .next/static folder

# Use bundle analyzer (if configured)
npm run build -- --analyze
```

### Lighthouse Testing (Local)
```bash
# Start production server
npm run build
npm start

# Open Chrome DevTools
# → Lighthouse tab
# → Generate report
```

### Vercel Analytics
```bash
# View in Vercel dashboard
# Project → Analytics tab
# Check performance metrics
```

---

## Database & API Commands

### Migrate Database
```bash
# Run migrations (if using)
npm run migrate

# Seed database
npm run seed

# Check database status
npm run db:status
```

### API Testing
```bash
# Using curl
curl http://localhost:3000/api/questions

# Using fetch in browser console
fetch('/api/questions').then(r => r.json()).then(console.log)

# Using httpie (install: npm install -g http)
http GET http://localhost:3000/api/questions
```

---

## Dependency Management

### Add New Package
```bash
# Install package
npm install package-name

# Install specific version
npm install package-name@1.2.3

# Install dev dependency
npm install --save-dev package-name

# Update all packages
npm update

# Check for outdated packages
npm outdated
```

### Remove Package
```bash
# Uninstall package
npm uninstall package-name

# Prune unused dependencies
npm prune
```

### Check Security Issues
```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Fix with latest versions
npm audit fix --force
```

---

## Testing Commands

### Run Tests (if configured)
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- Dashboard.test.tsx

# Generate coverage report
npm test -- --coverage
```

---

## Deployment Verification

### After Deploying
```bash
# Check deployment status
vercel status

# Get deployment URL
vercel inspect

# Test deployed app
curl https://your-app.vercel.app

# Check all deployments
vercel list
```

### Rollback to Previous Version
```bash
# List all deployments
vercel list

# Promote previous deployment
vercel promote <deployment-id>

# Or via CLI
vercel rollback
```

---

## Custom Domain Setup

### Add Domain to Vercel
```bash
# Using CLI
vercel domains add your-domain.com

# Verify ownership (follow prompts)

# Check domain status
vercel domains list

# Remove domain
vercel domains remove your-domain.com
```

---

## SSL/TLS Certificates

### Vercel Auto-SSL
```bash
# Vercel automatically provides free SSL
# No commands needed!
# Automatically renews before expiration

# To check certificate
# Settings → Domains → your-domain.com
# Certificate info shown in dashboard
```

---

## Backup & Recovery

### Backup Code
```bash
# GitHub is your backup
# All code is version controlled

# Export database backup (cloud DBs handle this)
# Supabase: Dashboard → Backups
# MongoDB: Atlas → Backups

# Download backup
vercel download-artifacts
```

### Recovery
```bash
# Restore from git history
git log --oneline
git checkout <commit-hash>

# Restore from Vercel backups
# Via Vercel dashboard → Deployments
```

---

## Utility Commands

### Generate .env Example
```bash
cp .env.local .env.example
# Edit to remove sensitive values
```

### Check Node/NPM Version
```bash
node --version
npm --version
```

### Update NPM to Latest
```bash
npm install -g npm@latest
```

### Get Help for Any Command
```bash
# Next.js help
npx next --help

# Vercel help
vercel --help

# NPM help
npm help <command>
```

---

## Shortcuts & Aliases

### Create Helpful Aliases (Mac/Linux)
```bash
# Add to ~/.bashrc or ~/.zshrc
alias zdev='cd ~/projects/zenith && npm run dev'
alias zbuild='cd ~/projects/zenith && npm run build'
alias zdeploy='cd ~/projects/zenith && git push && vercel --prod'

# Reload shell
source ~/.bashrc
# or
source ~/.zshrc
```

### Windows PowerShell Aliases
```powershell
# Create in $PROFILE
function zdev { cd C:\projects\zenith; npm run dev }
function zbuild { cd C:\projects\zenith; npm run build }
function zdeploy { cd C:\projects\zenith; git push; vercel --prod }

# Create profile if doesn't exist
New-Item -Path $PROFILE -ItemType File -Force
```

---

## Emergency Commands

### If App Won't Start
```bash
# Clear everything and start fresh
rm -rf node_modules .next
npm install
npm run dev
```

### If Port is Blocked
```bash
# Use different port
npm run dev -- -p 3001

# Or kill the process using the port
# Mac/Linux: lsof -i :3000 && kill -9 <PID>
# Windows: netstat -ano | findstr :3000
```

### If Deployment Fails
```bash
# Check local build works first
npm run build

# Check all files are committed
git status

# Push again
git push origin main

# Check deployment logs
vercel logs --since 1h
```

---

## Summary

| Task | Command |
|------|---------|
| Start dev | `npm run dev` |
| Build | `npm run build` |
| Deploy | `vercel --prod` |
| Install deps | `npm install` |
| Add package | `npm install package-name` |
| Git commit | `git commit -m "message"` |
| Git push | `git push origin main` |
| Check status | `git status` |
| Vercel logs | `vercel logs` |
| Check version | `node --version` |

---

**Need help?** Check QUICK_START.md and DEPLOYMENT.md files!
