
# 🚀 Netlify Deployment Guide for EINSPOT Solutions

## Overview
This guide will help you deploy your EINSPOT Solutions website to Netlify with your custom domain (einspot.com) while maintaining connection to your Supabase database.

## Prerequisites
- A Netlify account (free tier available)
- Access to your domain registrar for einspot.com
- Your Supabase project credentials
- GitHub repository (optional but recommended)

---

## 📦 Step 1: Prepare Your Project for Deployment

### 1.1 Environment Variables Setup
Create a `.env.production` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://huqromtnbpbpwvhemgrb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1cXJvbXRuYnBicHd2aGVtZ3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzkyNjgsImV4cCI6MjA2ODY1NTI2OH0.2jdtQtY7bUOXLLxVrv5USkOz0Wk2NClSOKo1puuUQwo

# Company Information
VITE_COMPANY_PHONE=+2348123647982
VITE_COMPANY_EMAIL=info@einspot.com
VITE_COMPANY_EMAIL_ALT=info@einspot.com.ng
```

### 1.2 Build Configuration
Ensure your `package.json` has the correct build script:

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### 1.3 Create Netlify Configuration
Create a `netlify.toml` file in your project root:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://huqromtnbpbpwvhemgrb.supabase.co wss://huqromtnbpbpwvhemgrb.supabase.co https://api.whatsapp.com; frame-ancestors 'none';"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 🌐 Step 2: Deploy to Netlify

### Option A: Deploy from GitHub (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Choose GitHub and authorize
   - Select your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Node version: `18`

### Option B: Manual Deploy

1. **Build your project locally**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Drag and drop your `dist` folder to the deploy area

---

## 🔧 Step 3: Configure Environment Variables

1. **In Netlify Dashboard**
   - Go to Site settings > Environment variables
   - Add each environment variable from your `.env.production` file:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_COMPANY_PHONE`
     - `VITE_COMPANY_EMAIL`
     - `VITE_COMPANY_EMAIL_ALT`

2. **Redeploy your site**
   - Go to Deploys tab
   - Click "Trigger deploy" > "Deploy site"

---

## 🌍 Step 4: Configure Custom Domain (einspot.com)

### 4.1 Add Domain to Netlify
1. **In Netlify Dashboard**
   - Go to Site settings > Domain management
   - Click "Add custom domain"
   - Enter `einspot.com`
   - Click "Verify"

2. **Add www subdomain**
   - Click "Add domain alias"
   - Enter `www.einspot.com`

### 4.2 Configure DNS Records
**At your domain registrar (where you bought einspot.com):**

1. **Add A Records**
   ```
   Type: A
   Name: @
   Value: 75.2.60.5
   TTL: 3600
   ```

2. **Add CNAME for www**
   ```
   Type: CNAME
   Name: www
   Value: your-site-name.netlify.app
   TTL: 3600
   ```

3. **Alternative: Use Netlify DNS (Recommended)**
   - In Netlify Dashboard, go to Domain management
   - Click "Set up Netlify DNS"
   - Update your domain's nameservers to:
     - `dns1.p01.nsone.net`
     - `dns2.p01.nsone.net`
     - `dns3.p01.nsone.net`
     - `dns4.p01.nsone.net`

### 4.3 Enable HTTPS
1. **In Netlify Dashboard**
   - Go to Site settings > Domain management
   - Scroll to HTTPS section
   - Click "Verify DNS configuration"
   - Wait for SSL certificate to be issued (usually 1-24 hours)

---

## 🔒 Step 5: Supabase Configuration Updates

### 5.1 Update Supabase Settings
1. **In Supabase Dashboard**
   - Go to Settings > API
   - Add your Netlify URL to allowed origins:
     - `https://einspot.com`
     - `https://www.einspot.com`
     - `https://your-site-name.netlify.app`

2. **Update Authentication Settings**
   - Go to Authentication > URL Configuration
   - Set Site URL to: `https://einspot.com`
   - Add Redirect URLs:
     - `https://einspot.com/auth/callback`
     - `https://www.einspot.com/auth/callback`

### 5.2 Update CORS Settings
```sql
-- Run this in Supabase SQL Editor if needed
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## 🚀 Step 6: Deployment Verification

### 6.1 Test Your Deployment
1. **Visit your site**
   - Go to `https://einspot.com`
   - Test all major features:
     - User authentication
     - Product catalog
     - Contact forms
     - Admin dashboard
     - Blog posts
     - Project portfolio

2. **Check Mobile Responsiveness**
   - Test on various devices
   - Verify navigation works properly
   - Check form submissions

### 6.2 Performance Optimization
1. **Enable Build Optimization**
   - In Netlify Dashboard > Site settings > Build & deploy
   - Enable "Asset optimization"
   - Enable "Pretty URLs"

2. **Configure Analytics**
   - Go to Site settings > Analytics
   - Enable Netlify Analytics (optional)

---

## 🔧 Step 7: Continuous Deployment Setup

### 7.1 Automatic Deployments
If using GitHub integration:
1. **Branch Protection**
   - Main branch deploys automatically
   - Create staging branch for testing

2. **Build Hooks**
   - Go to Site settings > Build & deploy
   - Add build hook for manual triggers

### 7.2 Preview Deployments
- Every pull request creates a preview URL
- Test changes before merging

---

## 🛠️ Troubleshooting Common Issues

### Build Errors
```bash
# Common solutions
npm install --legacy-peer-deps
npm run build --verbose
```

### Environment Variables Not Working
- Ensure all variables start with `VITE_`
- Check for typos in variable names
- Redeploy after adding variables

### Domain Not Resolving
- Wait 24-48 hours for DNS propagation
- Check DNS settings with: `nslookup einspot.com`
- Verify nameservers are correct

### SSL Certificate Issues
- Ensure DNS is properly configured
- Wait for certificate generation
- Check domain verification status

---

## 📊 Monitoring & Maintenance

### 7.1 Set Up Monitoring
1. **Netlify Analytics**
   - Track site performance
   - Monitor traffic patterns

2. **Supabase Monitoring**
   - Check database performance
   - Monitor API usage

### 7.2 Regular Maintenance
- **Monthly**: Update dependencies
- **Quarterly**: Review security settings
- **As needed**: Content updates via admin panel

---

## 📞 Support & Resources

### Documentation
- [Netlify Documentation](https://docs.netlify.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)

### EINSPOT Support
- **Email**: info@einspot.com
- **Phone**: +234 812 364 7982
- **Business Hours**: Mon-Sat 8AM-7PM WAT

---

## 🎉 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Build process tested locally
- [ ] All features working in development
- [ ] Security headers configured
- [ ] Netlify.toml file created

### During Deployment
- [ ] Site deployed successfully
- [ ] Environment variables added to Netlify
- [ ] Custom domain configured
- [ ] SSL certificate enabled
- [ ] Supabase settings updated

### Post-Deployment
- [ ] Site accessible at einspot.com
- [ ] All features working in production
- [ ] Authentication flow tested
- [ ] Admin dashboard accessible
- [ ] Contact forms working
- [ ] Mobile responsiveness verified
- [ ] Performance optimized

---

**🎯 Your EINSPOT Solutions website is now live at https://einspot.com!**

For any deployment issues or questions, contact the EINSPOT technical team.
