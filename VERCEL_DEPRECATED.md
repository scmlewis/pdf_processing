# Deprecated: Vercel Deployment

⚠️ **This folder and files are deprecated. The project is now deployed on Render.com**

## Why We Switched from Vercel to Render

The application was originally set up for Vercel deployment but has since been migrated to **Render.com** for the following reasons:

### Issues with Vercel

1. **Cold Start Issues** - Vercel's serverless functions had slow cold starts
2. **Complex Configuration** - Vercel required specific API configuration for full-stack apps
3. **Build Errors** - Schema validation issues with `vercel.json`
4. **Deployment Reliability** - Occasional build failures and 404 errors

### Advantages of Render.com

1. ✅ **Simple Setup** - Just connect GitHub, auto-deploy
2. ✅ **Full-Stack Support** - No special configuration needed
3. ✅ **Reliable Builds** - Consistent deployment experience
4. ✅ **Better Documentation** - Clear guides for common scenarios
5. ✅ **Cost Effective** - Free tier is generous enough for this use case
6. ✅ **No Cold Starts** - App stays warm (free tier only has 15 min inactivity)

---

## Current Deployment

**Platform:** Render.com  
**URL:** https://pdf-processor-uugw.onrender.com  
**Auto-Deploy:** ✅ Enabled via GitHub

See `DEPLOYMENT.md` for current deployment documentation.

---

## Archived Vercel Files

The following files were used for Vercel deployment and are no longer needed:

### 1. `vercel.json`
- Contains Vercel-specific build configuration
- No longer used by build process
- Kept for reference only

### 2. `.vercelignore`
- Tells Vercel which files to ignore
- Not needed for Render deployment
- Can be safely deleted

### 3. `setup-vercel.sh` / `setup-vercel.bat`
- Scripts for setting up Vercel CLI
- No longer needed
- Can be safely deleted

### 4. `VERCEL_DEPLOYMENT.md`
- Old Vercel deployment guide
- Replaced by `DEPLOYMENT.md`
- Kept for historical reference

### 5. `DEPLOYMENT_CHECKLIST.md`
- Vercel-specific deployment checklist
- No longer relevant
- Can be safely deleted

### 6. `DEPLOYMENT_COMMANDS.md`
- Old Vercel deployment commands
- Replaced by `DEPLOYMENT.md`
- Can be safely deleted

### 7. `DEPLOYMENT_STATUS.md`
- Vercel deployment tracking document
- No longer relevant
- Can be safely deleted

### 8. `READY_TO_DEPLOY.md`
- Vercel deployment readiness checklist
- Replaced by current Render deployment
- Can be safely deleted

### 9. `api.js` and `api/` folder
- Vercel serverless function entry point
- Not used by Render deployment
- Can be safely deleted

---

## How to Clean Up (Optional)

If you want to remove deprecated Vercel files:

```bash
# Remove Vercel configuration files
git rm vercel.json
git rm .vercelignore
git rm setup-vercel.sh
git rm setup-vercel.bat
git rm api.js
git rm -r api/

# Remove deprecated documentation
git rm VERCEL_DEPLOYMENT.md
git rm DEPLOYMENT_CHECKLIST.md
git rm DEPLOYMENT_COMMANDS.md
git rm DEPLOYMENT_STATUS.md
git rm READY_TO_DEPLOY.md

# Commit changes
git commit -m "Remove deprecated Vercel deployment files"

# Push to GitHub
git push origin main
```

---

## Migration Summary

### What Changed
- Removed Vercel-specific configuration
- Simplified deployment process
- Updated documentation to reflect Render

### What Stayed the Same
- All source code (server/, client/)
- All features and functionality
- All API endpoints
- GitHub repository

### What Improved
- More reliable builds
- Simpler deployment process
- Better documentation
- No need for special configuration

---

## If You Need to Switch Platforms Again

The application is designed to be platform-agnostic. To deploy to a different platform:

1. Ensure `npm start` works locally
2. Ensure `client/build/` is created with `npm run build`
3. Use these commands in your deployment platform:
   - **Build:** `npm install && cd client && npm install && npm run build`
   - **Start:** `npm start`
4. Set `PORT` environment variable to desired port
5. That's it!

The app can run on:
- ✅ Render.com (current)
- ✅ Railway
- ✅ Heroku
- ✅ AWS Elastic Beanstalk
- ✅ Google Cloud Run
- ✅ Azure App Service
- ✅ DigitalOcean App Platform
- ✅ Any server with Node.js

---

## Historical Reference

### Original Vercel Configuration

For reference, the original `vercel.json` file contained:

```json
{
  "version": 2,
  "buildCommand": "npm install && cd client && npm install && npm run build",
  "builds": [
    {
      "src": "api.js",
      "use": "@vercel/node",
      "config": {
        "maxLambdaSize": "50mb",
        "includeFiles": "client/build/**"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api.js"
    }
  ]
}
```

This configuration:
- Defined custom build process
- Set up serverless function entry point
- Configured routing rules

With Render, none of this is needed. Render handles everything automatically.

---

## Support

For current deployment issues, see:
- `DEPLOYMENT.md` - Current deployment guide
- `README.md` - Project documentation
- `QUICKSTART.md` - Getting started guide

For questions about the application itself:
- Check the built-in user guide (? button in the app)
- Review API documentation in `README.md`
- Check GitHub issues: https://github.com/scmlewis/pdf_processing

---

**Last Updated:** December 2025  
**Status:** Render.com deployment active and working  
**Vercel Files:** Deprecated and can be safely removed
