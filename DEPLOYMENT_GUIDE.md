# 🚀 Ganpathi Overseas ERP - Server Deployment Guide

This guide covers deploying the Ganpathi Overseas ERP system to production with remote Supabase database.

## 📋 Prerequisites

- [Supabase](https://supabase.com) account
- [Vercel](https://vercel.com) account (recommended) or any Node.js hosting platform
- [Node.js](https://nodejs.org) 18+ on your deployment platform

## 🏗️ Step 1: Set up Remote Supabase Database

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a database password and remember it
3. Wait for project initialization (2-3 minutes)

### 1.2 Configure Database Schema

1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire content from `deploy-to-supabase.sql`
3. Paste and run the SQL script
4. Verify tables are created in Database → Tables

### 1.3 Get Supabase Credentials

From your Supabase Dashboard → Settings → API:

- **Project URL**: `https://your-project-ref.supabase.co`
- **Anon Public Key**: `eyJhbGc...` (public key)
- **Service Role Key**: `eyJhbGc...` (secret key - keep secure!)

## 🔧 Step 2: Configure Environment Variables

### 2.1 Create Production Environment File

Create `.env.production` with your actual values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database URL for migrations
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres

# Next.js Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secure-random-string-here

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2.2 Generate Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use online generator: https://generate-secret.vercel.app/32
```

## 🌐 Step 3: Deploy to Vercel (Recommended)

### 3.1 Deploy via GitHub

1. Push your code to GitHub repository
2. Connect to Vercel: [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard
5. Deploy!

### 3.2 Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# Redeploy with env vars
vercel --prod
```

## 🐳 Step 4: Alternative - Docker Deployment

### 4.1 Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copy environment variables for build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 4.2 Build and Run Docker Container

```bash
# Build image
docker build -t ganpathi-erp \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your-supabase-url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  .

# Run container
docker run -p 3000:3000 \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  -e NEXTAUTH_SECRET=your-secret \
  -e NEXTAUTH_URL=https://your-domain.com \
  ganpathi-erp
```

## ⚙️ Step 5: Configure Supabase Authentication

### 5.1 Set up Authentication in Supabase Dashboard

1. Go to Authentication → Settings
2. Set Site URL: `https://your-domain.com`
3. Add Redirect URLs:
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/dashboard`

### 5.2 Configure Email Settings (Optional)

1. Go to Authentication → Settings → SMTP Settings
2. Configure your email provider (Gmail, SendGrid, etc.)
3. Test email delivery

## 🔒 Step 6: Security Configuration

### 6.1 Update Row Level Security Policies

Access Supabase Dashboard → Authentication → Policies and customize based on your needs.

### 6.2 Configure Database Backups

1. Go to Settings → Database
2. Enable daily automatic backups
3. Configure backup retention period

### 6.3 Set up Monitoring

1. Enable Supabase monitoring and alerts
2. Configure uptime monitoring (UptimeRobot, etc.)
3. Set up error tracking (Sentry, LogRocket, etc.)

## 🧪 Step 7: Test Deployment

### 7.1 Verify Database Connection

1. Visit `https://your-domain.com/api/db-check`
2. Should return successful connection status

### 7.2 Test Authentication

1. Visit `https://your-domain.com/sign-in`
2. Login with default admin credentials:
   - Email: `admin@ganpathioverseas.com`
   - Password: `admin123`

### 7.3 Test Core Features

- ✅ Dashboard loads correctly
- ✅ Job creation works
- ✅ Party management functions
- ✅ Financial reports generate
- ✅ All user roles accessible

## 📊 Step 8: Performance Optimization

### 8.1 Enable Caching

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ["@supabase/supabase-js"],
  },
  images: {
    domains: ["your-project-ref.supabase.co"],
  },
};
```

### 8.2 Set up CDN (Optional)

- Configure Vercel Edge Network
- Or use Cloudflare for additional caching

## 🔧 Step 9: Post-Deployment Tasks

### 9.1 Change Default Passwords

```sql
-- Update admin password in Supabase SQL Editor
UPDATE users
SET password_hash = crypt('your-new-secure-password', gen_salt('bf'))
WHERE email = 'admin@ganpathioverseas.com';
```

### 9.2 Add Real Users

1. Use the admin panel to create real user accounts
2. Disable or remove demo data if needed
3. Configure proper user roles and permissions

### 9.3 Backup Strategy

1. Schedule regular database exports
2. Document recovery procedures
3. Test backup restoration process

## 🚨 Troubleshooting

### Common Issues:

**Database Connection Failed**

- Verify Supabase URL and keys
- Check environment variables are set correctly
- Ensure database schema is properly migrated

**Authentication Not Working**

- Check NEXTAUTH_URL matches your domain
- Verify Supabase auth settings
- Ensure redirect URLs are configured

**Build Failures**

- Verify all environment variables are available during build
- Check for missing dependencies
- Review build logs for specific errors

**Performance Issues**

- Enable database indexing for slow queries
- Implement proper caching strategies
- Monitor Supabase usage metrics

## 📞 Support

For deployment issues:

1. Check Vercel deployment logs
2. Review Supabase Dashboard → Logs
3. Monitor application error tracking
4. Check database performance metrics

## 🎉 Success!

Your Ganpathi Overseas ERP system is now deployed and running on production infrastructure with:

- ✅ Secure remote Supabase database
- ✅ Scalable cloud hosting
- ✅ Automatic backups
- ✅ SSL encryption
- ✅ Real-time data synchronization
- ✅ Role-based access control

Access your system at: `https://your-domain.com`

Default admin login:

- Email: `admin@ganpathioverseas.com`
- Password: `admin123` (remember to change this!)
