# Vercel Deployment Guide

## Prerequisites
- GitHub account (free)
- Vercel account (free)
- Git installed on your computer

---

## Step 1: Initialize Git Repository

Open terminal in your project root (`pdf_processing` folder):

```bash
# Check if git is already initialized
git status

# If not, initialize git
git init
```

---

## Step 2: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `pdf_processing`
3. **Do NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

---

## Step 3: Push to GitHub

Run these commands in your project root:

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: PDF Processor with drag-drop, dark mode, and progress indicators"

# Rename branch to main (if needed)
git branch -M main

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/pdf_processing.git

# Push to GitHub
git push -u origin main
```

---

## Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign up" and choose "GitHub"
3. Authorize Vercel to access your GitHub
4. Click "New Project"
5. Select your `pdf_processing` repository
6. Vercel auto-detects the setup
7. Click "Deploy"

**Wait 2-5 minutes for deployment to complete**

---

## Step 5: Your Live URL

After deployment:
- You'll get a URL like: `https://pdf-processor-xyz.vercel.app`
- Share this URL - your app is now live!
- Redeploys automatically when you push to GitHub

---

## Important Notes for Vercel

### File Uploads Limitation
- Vercel uses serverless functions with temporary storage
- Uploaded files are **deleted after request completes**
- **Solution:** Use external storage like:
  - **Cloudinary** (free: 25GB) - Recommended
  - **AWS S3** (free tier: 5GB)

### For Now (Development)
Your current setup works, but uploads won't persist. This is fine for:
- Testing the app
- Demoing to others
- Development phase

### To Add Persistent Storage Later
See the "Optional: Add Cloud Storage" section below

---

## Troubleshooting

### Deployment Fails
**Check build logs in Vercel:**
1. Go to your Vercel dashboard
2. Click your project
3. Go to "Deployments" tab
4. Click latest deployment
5. Click "Logs" to see errors

**Common issues:**
- Missing dependencies: Run `npm install` locally and commit `package-lock.json`
- Wrong Node version: Vercel uses latest LTS by default
- Port issue: We use `process.env.PORT` which Vercel sets automatically

### Build Takes Too Long
- Normal on free tier
- First build: 2-5 minutes
- Subsequent builds: 1-2 minutes

---

## Making Changes

**To update your live app:**

```bash
# Make changes to your code
# Test locally first

git add .
git commit -m "Describe your changes"
git push origin main
```

Vercel automatically detects the push and redeploys!

---

## Optional: Add Cloud Storage (For Persistent Uploads)

If you want uploaded files to persist:

### Using Cloudinary (Recommended)

1. Sign up for free at [cloudinary.com](https://cloudinary.com)
2. Get your API keys from dashboard
3. Add to Vercel environment variables:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
4. Update backend to use Cloudinary for file storage

---

## Next Steps

1. **Push to GitHub** (follow Step 3 above)
2. **Deploy to Vercel** (follow Step 4 above)
3. **Test your live app** at the generated URL
4. **Share the link** with others!

---

## Support

If deployment fails:
- Check Vercel deployment logs
- Verify all dependencies are in `package.json`
- Ensure `vercel.json` is in project root
- Contact Vercel support at [vercel.com/support](https://vercel.com/support)

---

## Environment Variables on Vercel

If you add any `.env` variables later:

1. Go to Vercel Project Settings
2. Find "Environment Variables"
3. Add your variables (they won't be checked into git due to `.gitignore`)
4. Redeploy for changes to take effect

---

Good luck! 🚀
