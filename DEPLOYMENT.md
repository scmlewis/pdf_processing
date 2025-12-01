# Deployment Guide

## Current Deployment: Render.com

The PDF Processor application is deployed on **Render.com**, a modern cloud platform with free tier support.

**Live Application:** https://pdf-processor-uugw.onrender.com

---

## Why Render.com?

### Advantages
- ✅ **Free Tier** - No credit card required
- ✅ **Easy GitHub Integration** - Auto-deploy on push
- ✅ **Full-Stack Support** - Handles both frontend and backend
- ✅ **No Cold Starts** - Smooth performance (Render's free tier is reliable)
- ✅ **Auto-HTTPS** - SSL included
- ✅ **Custom Domains** - Easy to set up
- ✅ **Environment Variables** - Built-in support

### Free Tier Limitations
- Free instances spin down after 15 minutes of inactivity
- First request after spin-down takes 5-10 seconds
- 512MB RAM (sufficient for this app)
- 1GB disk space

---

## How Automatic Deployment Works

### Automatic Deployment Flow

```
Local Computer
    ↓
git push origin main
    ↓
GitHub
    ↓
Webhook Trigger
    ↓
Render
    ├─ Clone repo
    ├─ Install dependencies
    ├─ Build React app
    ├─ Start Node.js server
    └─ Deploy
    ↓
App is live in 2-3 minutes
```

### Step-by-Step Process

1. **Make changes locally**
   ```bash
   # Edit files, test locally
   npm start  # Backend
   npm run client  # Frontend (separate terminal)
   ```

2. **Commit and push**
   ```bash
   git add -A
   git commit -m "Your changes"
   git push origin main
   ```

3. **Render auto-deploys**
   - Render detects the push via GitHub webhook
   - Automatically rebuilds and redeploys
   - Takes 2-3 minutes total

4. **Access live app**
   - Visit https://pdf-processor-uugw.onrender.com
   - New changes are live!

---

## Manual Deployment Steps (First Time)

If you want to deploy this app to Render yourself:

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create repository named `pdf_processing`
3. Make it public or private (your choice)
4. Click "Create repository"

### Step 2: Push Code to GitHub

```bash
# In your project directory
git remote add origin https://github.com/YOUR_USERNAME/pdf_processing.git
git branch -M main
git push -u origin main
```

### Step 3: Create Render Account

1. Go to https://render.com
2. Click "Sign Up"
3. Sign up with GitHub (recommended for auto-deploy)
4. Authorize Render to access your repositories

### Step 4: Create New Service on Render

1. Click "New +" → "Web Service"
2. Select your `pdf_processing` repository
3. Configure:
   - **Name:** pdf-processor
   - **Environment:** Node
   - **Build Command:** `npm install && cd client && npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. Click "Create Web Service"
5. Wait 5-10 minutes for build and deployment

### Step 5: Access Your App

- Render will assign a URL like `https://pdf-processor-xxxxx.onrender.com`
- Your app is now live!

---

## Deployment Configuration

### Build Settings

**Build Command:**
```bash
npm install && cd client && npm install && npm run build
```

This command:
1. Installs backend dependencies
2. Installs frontend dependencies
3. Builds React production bundle

### Start Command

```bash
npm start
```

This command:
1. Starts Express server on port 5000
2. Serves built React app from `client/build/`
3. Handles API requests

### Environment Configuration

**Port:** Automatically configured via `PORT` environment variable

**Node Environment:** Set to `production` automatically

No `.env` file needed for basic deployment. Add environment variables in Render Dashboard if needed:

1. Render Dashboard → Your Service → Settings
2. Scroll to "Environment"
3. Add variables
4. Redeploy

---

## Monitoring Deployment

### View Deployment Status

1. Go to Render Dashboard
2. Select your service
3. Check "Deploys" tab
4. See build logs and deployment history

### Common Build Issues

**Build fails: Module not found**
- Solution: Ensure `package-lock.json` is committed
- Run locally: `npm install && cd client && npm install`
- Commit: `git add package-lock.json && git commit`

**API returns 404**
- Check that server routes are correctly configured
- Verify `server/routes/pdf.js` exists
- Check `server/index.js` loads routes correctly

**App loads but features don't work**
- Check browser console for errors (F12)
- View Render logs in dashboard
- Ensure API endpoints match frontend URLs

### View Logs

1. Render Dashboard → Your Service
2. Click "Logs" tab
3. See real-time application logs
4. Useful for debugging issues

---

## Making Updates

### Update Workflow

```
Make changes locally
    ↓
Test locally:
  Terminal 1: npm start
  Terminal 2: npm run client
    ↓
Commit changes:
  git add -A
  git commit -m "description"
    ↓
Push to GitHub:
  git push origin main
    ↓
Render auto-deploys (2-3 min)
    ↓
Check live app
```

### Update File Limits

To increase upload limits:

1. Edit `server/index.js`:
   - Change `express.json({ limit: '200mb' })`

2. Edit `server/routes/pdf.js`:
   - Modify `multer` fileSize limit
   - Change `upload.array('files', 50)` for combine limit

3. Commit and push:
   ```bash
   git add -A
   git commit -m "Increase file limits"
   git push
   ```

4. Render redeploys automatically

### Add New Features

1. Create feature branch (optional):
   ```bash
   git checkout -b feature/my-feature
   ```

2. Develop and test locally

3. Commit:
   ```bash
   git add -A
   git commit -m "Add new feature"
   ```

4. Push:
   ```bash
   git push origin main
   ```

5. Render auto-deploys

---

## Performance Optimization

### Caching

Render caches builds by default. If you need to clear cache:

1. Render Dashboard → Your Service
2. Click "Settings"
3. Scroll to "Clear Build Cache"
4. Click button to clear and redeploy

### Database Integration (Future)

To add a database:

1. Render Dashboard → Databases
2. Create new PostgreSQL database
3. Note the connection string
4. Add to environment variables
5. Update your code to use database

### Custom Domain

To use your own domain:

1. Purchase domain (Namecheap, GoDaddy, etc.)
2. Render Dashboard → Your Service → Settings
3. Scroll to "Custom Domains"
4. Add your domain
5. Follow Render's DNS setup instructions

---

## Troubleshooting Deployment

### App won't build

**Error: "npm: not found"**
- Make sure `package.json` exists in root
- Ensure all dependencies are specified

**Error: "React build failed"**
- Run locally: `cd client && npm run build`
- Fix any build errors
- Commit and push again

### App builds but won't start

**Error: "Port already in use"**
- Render uses dynamic PORT environment variable
- Check `server/index.js` uses: `const port = process.env.PORT || 5000`

**Error: "Cannot find module"**
- Ensure `package-lock.json` is committed
- Run locally: `npm install`
- Commit and push again

### API requests fail

**Error: 404 Not Found**
- Verify routes are in `server/routes/pdf.js`
- Check `server/index.js` mounts routes at `/api/pdf`
- Look at Render logs for errors

**Error: CORS issues**
- Check `server/index.js` has CORS configured
- Verify frontend API calls use correct URL

### Slow performance

**First request takes 10+ seconds**
- This is cold start (free tier spins down after inactivity)
- Subsequent requests are fast
- Upgrade to paid plan to avoid spin-down

**Uploads are slow**
- Reduce file size or number of files
- Use compression before uploading
- Check upload limits in `server/routes/pdf.js`

---

## Cost

### Free Tier
- ✅ Unlimited apps
- ✅ Automatic HTTPS
- ✅ GitHub integration
- ⚠️ Spins down after 15 min inactivity

### Paid Tier (Optional)
- **$7/month** - Prevents spin-downs
- **No sleep** - Always responsive
- **More RAM** - Faster processing

Current deployment uses free tier. No cost required!

---

## Rollback to Previous Version

If an update causes issues:

```bash
# View commit history
git log --oneline

# Revert to previous version
git revert <commit-hash>

# Or reset to specific commit
git reset --hard <commit-hash>

# Push changes
git push origin main

# Render will redeploy the old version
```

---

## Backup and Restore

### Backup Code

Code is automatically backed up in GitHub:
- https://github.com/scmlewis/pdf_processing
- Every commit is saved
- Can restore any previous version

### Backup Uploaded Files

Uploaded files are temporary and deleted after request. No permanent backup needed.

To persist files long-term, integrate with:
- **Cloudinary** - Free image/file storage
- **AWS S3** - Affordable file storage
- **Google Cloud Storage** - Enterprise option

---

## Next Steps

1. ✅ App is deployed at https://pdf-processor-uugw.onrender.com
2. ✅ GitHub has all code and history
3. ✅ Future pushes auto-deploy automatically
4. Test all features on live app
5. Share with friends/colleagues
6. Make improvements and push updates

---

## Useful Links

- **Live App:** https://pdf-processor-uugw.onrender.com
- **GitHub:** https://github.com/scmlewis/pdf_processing
- **Render:** https://render.com
- **Documentation:** README.md, QUICKSTART.md
- **User Guide:** Built-in help (? button in app)

---

## Questions or Issues?

1. Check Render logs: Render Dashboard → Logs
2. Check GitHub issues: https://github.com/scmlewis/pdf_processing/issues
3. Review build output for errors
4. Test locally before pushing: `npm start` + `npm run client`

Happy deploying! 🚀
