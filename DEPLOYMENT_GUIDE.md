# SplashEasy V2 - Deployment Guide 🚀

## Quick Deploy to Vercel

### Prerequisites ✅
- [x] Vercel account created
- [x] Vercel API Token configured
- [x] OpenAI API Key configured
- [x] Supabase database schema executed

### One-Command Deployment

```bash
npx vercel --prod
```

### Step-by-Step Deployment

1. **Initialize Vercel Project**
   ```bash
   npx vercel login
   # Use your Vercel credentials
   
   npx vercel
   # Follow prompts:
   # - Set up project: Yes
   # - Which scope: Your personal account
   # - Project name: splasheasy-v2
   # - Directory: ./ (current)
   # - Framework: Next.js
   ```

2. **Configure Environment Variables**
   
   After first deployment, add these environment variables in Vercel Dashboard:
   
   **Go to**: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
   
   **Add these variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY = your-supabase-service-role-key
   OPENAI_API_KEY = sk-proj-your-openai-api-key
   ```

3. **Deploy to Production**
   ```bash
   npx vercel --prod
   ```

## Alternative: Deploy via Git Integration

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial SplashEasy V2 deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/splasheasy-v2.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import from GitHub repository
   - Configure environment variables (same as above)
   - Deploy

## Database Setup Reminder 🗄️

**CRITICAL**: Before testing, ensure you've executed the database schema:

1. Go to: https://supabase.com/dashboard/project/xblhoadgkohoxjpzjlsr
2. Navigate to: SQL Editor
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Execute the SQL script

## Post-Deployment Testing 🧪

After deployment, test these features:

1. **Homepage**: Visit your Vercel URL
2. **Camera Access**: Click "Start Free Test" (requires HTTPS)
3. **AI Analysis**: Take a test strip photo
4. **Results Display**: Verify chemistry readings appear
5. **Recommendations**: Check treatment suggestions

## Troubleshooting 🔧

### Common Issues:

**Camera not working:**
- Ensure deployment is HTTPS (Vercel provides this automatically)
- Check browser permissions for camera access

**AI analysis failing:**
- Verify OpenAI API key is correctly set in Vercel environment variables
- Check Vercel function logs for errors

**Database errors:**
- Confirm Supabase schema has been executed
- Check Supabase credentials in environment variables

### Debug Commands:

```bash
# Check local build
npm run build

# Test locally with production env
npm run start

# View Vercel logs
npx vercel logs
```

## Domain Configuration (Optional) 🌐

To use a custom domain:

1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Configure DNS according to Vercel instructions

## Performance Optimization ⚡

The app is configured for optimal performance:

- ✅ Next.js 15 with App Router
- ✅ Static page generation where possible
- ✅ API routes optimized for Edge runtime
- ✅ Image optimization (when using Next/Image)
- ✅ Bundle analysis available via `npm run analyze`

## Security Notes 🔒

- ✅ Environment variables properly configured
- ✅ API keys never exposed to client
- ✅ Supabase Row Level Security enabled
- ✅ CORS configured for your domain only
- ✅ Input validation on all API endpoints

## Monitoring & Analytics 📊

Consider adding:
- Vercel Analytics (built-in)
- Error tracking (Sentry)
- User analytics (Plausible/Google Analytics)

---

**🎉 Your SplashEasy V2 app is ready for the world!**

After deployment, share your Vercel URL to start getting user feedback on the AI-powered water testing experience.