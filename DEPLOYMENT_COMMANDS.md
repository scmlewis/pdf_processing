# Copy-Paste Deployment Commands

## Step 1: Initialize Git (Run in PowerShell in project root)

```powershell
git init
git add .
git commit -m "Initial commit: PDF Processor with drag-drop, dark mode, and progress indicators"
```

---

## Step 2: Create GitHub Repository

**Do this on GitHub website:**

1. Go to https://github.com/new
2. Repository name: `pdf_processing`
3. Description: `Web app for processing, combining, and manipulating PDF files`
4. Select: Public
5. **UNCHECK** "Add a README file"
6. **UNCHECK** "Add .gitignore"
7. Click "Create repository"
8. Copy the HTTPS URL from the page

---

## Step 3: Push to GitHub (Run in PowerShell)

Replace `YOUR_USERNAME` with your actual GitHub username:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pdf_processing.git
git push -u origin main
```

### If you get an error about credentials:
Newer versions of Git require a personal access token. Do this:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token"
3. Name it: `vercel-deploy`
4. Check: `repo` and `admin:repo_hook`
5. Click "Generate token"
6. Copy the token (it shows only once!)
7. When Git asks for password, paste the token

---

## Step 4: Deploy to Vercel

**Do this on Vercel website:**

1. Go to https://vercel.com
2. Click "Sign Up"
3. Click "Continue with GitHub"
4. Authorize Vercel
5. Click "New Project"
6. Find and click your `pdf_processing` repository
7. Vercel detects framework automatically ✓
8. Click "Deploy"
9. **Wait 2-5 minutes** for deployment
10. Click "Visit" to see your live app! 🎉

---

## Verify Deployment

**Test these URLs in your browser:**

```
https://YOUR_APP_NAME.vercel.app/              # Main app
https://YOUR_APP_NAME.vercel.app/api/health    # API health check
```

If both work, you're deployed! 🚀

---

## Make Updates Later

Every time you update code:

```powershell
git add .
git commit -m "Your change description"
git push origin main
```

Vercel automatically redeploys within 2 minutes!

---

## Get Your Live URL

After deployment, Vercel shows you a URL like:
```
https://pdf-processor-abc123.vercel.app
```

**This is your live app!** Share this link with others.

---

## Troubleshooting Commands

### Check git status
```powershell
git status
```

### See commit history
```powershell
git log --oneline
```

### Check remote connection
```powershell
git remote -v
```

### If you made a mistake, reset last commit (⚠️ careful!)
```powershell
git reset --soft HEAD~1
```

---

## Questions?

- **Git help:** https://git-scm.com/doc
- **Vercel help:** https://vercel.com/docs
- **GitHub help:** https://docs.github.com
- **See detailed guide:** `VERCEL_DEPLOYMENT.md`

Good luck! 🚀
