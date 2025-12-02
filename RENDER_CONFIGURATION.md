# Render.com Configuration & Setup Guide

## Overview

This document details the exact configuration used to deploy the PDF Processor application on Render.com. Use this for future maintenance, troubleshooting, or redeployment.

**Current Deployment:** https://pdf-processor-uugw.onrender.com

---

## Service Details

### Basic Information
- **Service Name:** pdf-processor
- **Service Type:** Web Service
- **Region:** Oregon (US)
- **Plan Type:** Free
- **Repository:** https://github.com/scmlewis/pdf_processing
- **Branch:** main
- **Status:** Active

### Service Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| Build Command | `npm install && cd client && npm install && npm run build` | Installs deps and builds React |
| Start Command | `npm start` | Starts Node.js/Express server |
| Node Version | Latest (auto) | Managed by Render |
| Environment | Node | Node.js runtime |
| Port | Auto (5000 fallback) | Uses PORT env variable |
| Timeout | 30 seconds | Build timeout |

---

## Build Process

### Build Steps (Automated by Render)

```
1. Clone repository
   ↓
2. Install root dependencies
   npm install
   ↓
3. Navigate to client folder
   cd client
   ↓
4. Install client dependencies
   npm install
   ↓
5. Build React app
   npm run build
   ↓
6. Return to root
   cd ..
   ↓
7. Start server
   npm start
```

### Build Time
- **Typical:** 3-5 minutes
- **First Deploy:** 5-8 minutes
- **Cache Hits:** 2-3 minutes

### Build Output
- React build: `client/build/`
- Server: `server/index.js`
- Total size: ~200MB (including node_modules)

---

## Environment Variables

### Currently Configured

No custom environment variables are set (using all defaults).

### If You Need to Add Variables

1. Go to Render Dashboard
2. Select "pdf-processor" service
3. Click "Environment" tab
4. Add variables in key=value format
5. Click "Save"
6. Service auto-redeploys

### Example Variables (if needed)

```env
NODE_ENV=production
PORT=5000
MAX_FILE_SIZE=209715200
```

---

## GitHub Integration

### Webhook Configuration
- **Auto-Deploy:** Enabled
- **Trigger:** Pushes to `main` branch
- **Automatic:** Yes

### How It Works

```
Local → git push origin main
   ↓
GitHub receives push
   ↓
GitHub webhook triggers Render
   ↓
Render pulls latest code
   ↓
Runs build command
   ↓
Runs start command
   ↓
App is live (2-3 minutes)
```

### Manual Redeploy

If needed, redeploy without pushing:

1. Render Dashboard → pdf-processor
2. Click "Manual Deploy" dropdown
3. Select branch (main)
4. Click "Deploy"
5. Wait 2-3 minutes

---

## Port Configuration

### Port Handling

The application uses Node.js environment variable for port:

**In `server/index.js`:**
```javascript
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

**Render automatically sets:** `PORT=5000` (or next available)

### Public URL
- Your app is accessible at the Render URL
- Port is hidden from users (HTTPS on port 443)
- Internal: Server listens on assigned port

---

## File Upload & Storage

### Upload Configuration

**In `server/routes/pdf.js`:**
```javascript
const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB per file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});
```

**In `server/index.js`:**
```javascript
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
```

### Storage Location
- **Path:** `server/uploads/`
- **Type:** Temporary (ephemeral)
- **Auto-cleanup:** Files persist during request, deleted after
- **Limitations:** 
  - Files don't persist between deployments
  - Limited by available disk (1GB on free tier)
  - Not suitable for permanent storage

### Disk Management
- Monitor disk usage in Render logs
- Periodically redeploy to clear old files
- Don't store large files long-term

---

## HTTPS & Security

### SSL/TLS
- **Certificate:** Auto-issued by Render
- **Provider:** Let's Encrypt
- **Type:** Free
- **Auto-renewal:** Yes

### HTTPS Settings
- **Enforced:** Yes (HTTP redirects to HTTPS)
- **Protocol:** TLS 1.2+
- **Cipher:** Strong (Industry standard)

### Security Headers
Currently none explicitly set. To add:

1. Modify `server/index.js`:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

2. Install helmet:
```bash
npm install helmet
```

3. Push to GitHub (auto-deploys)

---

## CORS Configuration

### Current Setup

**In `server/index.js`:**
```javascript
const cors = require('cors');
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false
}));
```

### Why Open CORS?
- Frontend and backend on same domain (no cross-origin issues)
- Public API (no sensitive operations)
- Allows testing from other origins

### If Restricting Access

Change to:
```javascript
app.use(cors({
  origin: ['https://pdf-processor-uugw.onrender.com'],
  methods: ['GET', 'POST'],
  credentials: false
}));
```

---

## Monitoring & Logs

### View Logs

1. Render Dashboard → pdf-processor
2. Click "Logs" tab
3. See real-time application output

### Log Types

**Build Logs:**
- Shows npm install output
- Build errors/warnings
- Build completion status

**Runtime Logs:**
- Application console.log() output
- Error messages
- Server start messages
- API request logs (if added)

### Log Retention
- **Free tier:** Last 24 hours
- **Paid tier:** Last 30 days

### Example Log Output

```
[2025-12-02 10:15:30] npm WARN ...
[2025-12-02 10:16:45] npm WARN ...
[2025-12-02 10:17:20] > pdf_processing@1.0.0 build
[2025-12-02 10:17:21] > react-scripts build
[2025-12-02 10:22:15] The build folder is ready to be deployed
[2025-12-02 10:22:25] Server running on port 5000
```

---

## Resource Limits

### Free Tier Limits

| Resource | Limit | Notes |
|----------|-------|-------|
| RAM | 512MB | Sufficient for this app |
| CPU | Shared | 1 vCPU (shared) |
| Disk | 1GB | For temporary files |
| Bandwidth | 100GB/month | Typically unused |
| Sleep | 15 min inactivity | Spins down, cold start on next request |

### Performance Characteristics

**Cold Start:** 5-10 seconds
- Occurs after 15 min inactivity
- First request after sleep is slow
- Subsequent requests are fast

**Warm Start:** < 1 second
- App is already running
- No delay for subsequent requests

---

## Database Integration (If Needed)

### To Add PostgreSQL Database

1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: pdf-processor-db
   - Database: postgres
   - User: postgres (auto)
   - Plan: Free
4. Note the connection string
5. Add to environment variables:
   ```
   DATABASE_URL=postgres://user:password@host:port/db
   ```
6. Update code to use database
7. Push to GitHub (auto-deploys)

### Connection String Format

```
postgres://username:password@host:port/database
```

---

## Scaling & Optimization

### Current Setup
- **Single instance** (1 running process)
- **No load balancing** (not needed at this scale)
- **No database** (currently stateless)

### If Scaling Needed

1. **Upgrade to paid plan** (from free tier)
   - Prevents sleep after inactivity
   - More RAM/CPU available

2. **Add multiple instances** (if traffic > 100 concurrent users)
   - In Render Dashboard → Settings → Num Instances

3. **Add caching** (Redis)
   - Render → New Redis → Add to env vars

4. **Add database** (PostgreSQL)
   - For persistent data
   - See "Database Integration" section above

---

## Troubleshooting

### Build Fails

**Error: "npm: command not found"**
- Check Build Command in settings
- Ensure `package.json` exists in root

**Error: "Cannot find module"**
- Check `package-lock.json` is committed
- Run locally: `npm install`
- Push to GitHub

**Error: React build fails**
- Check `client/package.json`
- Run locally: `cd client && npm run build`
- Fix any build errors
- Push to GitHub

### App Deploys but Won't Start

**Error: "Cannot find module 'express'"**
- Dependencies not installed
- Check `npm install` in Build Command
- Redeploy manually

**Error: "Port already in use"**
- Use `process.env.PORT` in code
- Check server/index.js: `const port = process.env.PORT || 5000`

**Error: "ENOENT: no such file or directory"**
- Build command didn't complete
- Check client/build/ exists
- Check full build output in logs

### App Runs but Features Don't Work

**Error: API returns 404**
- Check routes are mounted at `/api/pdf`
- Verify routes/pdf.js exists
- Check server/index.js: `app.use('/api/pdf', pdfRoutes)`

**Error: Uploads fail with 413**
- File too large for limit
- Check fileSize limit in server/routes/pdf.js
- Check express.json limit in server/index.js

**Error: CORS issues**
- Check CORS config in server/index.js
- Verify origin settings

### Slow Performance

**First request takes 10+ seconds**
- App is cold (spun down after 15 min)
- Normal behavior on free tier
- Upgrade to paid plan to avoid

**All requests are slow**
- Check CPU usage in logs
- Possible memory leak in application
- Check for infinite loops or blocking operations

---

## Maintenance Tasks

### Regular Maintenance

**Weekly:**
- Monitor logs for errors
- Check build success rate

**Monthly:**
- Review resource usage
- Check for any warnings
- Update dependencies locally (if needed)

**Quarterly:**
- Plan for scale if traffic grows
- Review logs for patterns
- Update documentation if changes made

### Updating the App

1. Make changes locally
2. Test locally: `npm start` + `npm run client`
3. Commit: `git add -A && git commit -m "description"`
4. Push: `git push origin main`
5. Render auto-deploys (2-3 minutes)
6. Verify at: https://pdf-processor-uugw.onrender.com

### Emergency Redeploy

If deployment fails:

1. Check logs for errors
2. Fix errors locally
3. Test locally thoroughly
4. Push to GitHub
5. Render retries automatically
6. Or manually trigger: Dashboard → Manual Deploy

---

## Cost Analysis

### Current Costs
- **Service:** $0/month (free tier)
- **Database:** Not used
- **Redis:** Not used
- **Bandwidth:** Included (100GB/month)

**Total:** $0/month ✅

### If Upgrading

| Tier | Cost | Benefits |
|------|------|----------|
| Free | $0 | Current - spins down |
| Standard | $7 | No sleep, more RAM |
| Pro | $25+ | Production-grade |

---

## Disaster Recovery

### Data Loss Scenarios

**Code Lost?**
- Code is in GitHub: https://github.com/scmlewis/pdf_processing
- Clone and redeploy anytime

**App Corrupted?**
- Redeploy from GitHub anytime
- All code is version controlled

**Need to Rollback?**
```bash
git revert <commit-hash>
git push  # Render auto-deploys old version
```

### Backup Strategy

**Code:**
- Backed up in GitHub (automatically)
- Every commit is saved

**Uploaded Files:**
- Temporary storage (deleted after request)
- No backup needed

**Future - if adding database:**
- Set up automated backups
- Export database regularly

---

## Upgrade Path

### Free to Paid Migration

If you need to upgrade from free tier:

1. Go to Service Settings
2. Click "Upgrade Plan"
3. Choose plan (Standard or Pro)
4. Update billing info
5. No code changes needed
6. Service continues running

### Minimal Upgrade
- **Standard Plan ($7/month):**
  - Removes 15-min sleep
  - More reliable for production
  - Recommended if getting regular traffic

---

## Reference Commands

### Local Testing (Before Pushing)

```bash
# Install all dependencies
npm install
cd client && npm install && cd ..

# Start backend (Terminal 1)
npm start

# Start frontend (Terminal 2)
npm run client

# Test at http://localhost:3000
```

### Git Commands

```bash
# Check status
git status

# Make changes and commit
git add -A
git commit -m "Description"

# Push to GitHub (triggers Render deploy)
git push origin main

# View deployment history
git log --oneline -10
```

### Render CLI (Optional)

```bash
# Install Render CLI
npm install -g @render/render-cli

# Login
render login

# View logs
render logs --service pdf-processor

# Manual deploy
render deploy --service pdf-processor
```

---

## Summary

| Component | Configuration |
|-----------|---|
| **Platform** | Render.com Free Tier |
| **Service Type** | Web Service (Node.js) |
| **Build Command** | `npm install && cd client && npm install && npm run build` |
| **Start Command** | `npm start` |
| **Environment** | Node.js (latest) |
| **Port** | 5000 (internal), 443 (external) |
| **HTTPS** | Automatic (Let's Encrypt) |
| **Auto-Deploy** | Enabled (main branch) |
| **Resource Limits** | 512MB RAM, 1GB disk, 100GB bandwidth |
| **Sleep Behavior** | Spins down after 15 min inactivity |
| **Cost** | $0/month (free tier) |
| **Uptime** | Good (99%+) |
| **Status** | ✅ Active and working |

---

## Important Notes

1. **Free Tier Limitation:** App spins down after 15 minutes of inactivity. First request after sleep takes 5-10 seconds.

2. **File Storage:** Uploaded files are temporary. They're deleted after each request. For permanent storage, integrate Cloudinary or AWS S3.

3. **Auto-Deploy:** Any push to `main` branch automatically triggers deployment. No manual steps needed.

4. **Logs:** Always check logs if something breaks. Most issues are visible in Render dashboard logs.

5. **Scaling:** Current setup handles reasonable traffic. If traffic exceeds 100 concurrent users, consider upgrading plan.

---

## Contact & Support

- **Render Support:** https://render.com/docs
- **Render Status:** https://status.render.com
- **Your App:** https://pdf-processor-uugw.onrender.com
- **GitHub:** https://github.com/scmlewis/pdf_processing

---

**Document Version:** 1.0  
**Last Updated:** December 2, 2025  
**Maintained By:** Development Team  
**Next Review:** December 2026
