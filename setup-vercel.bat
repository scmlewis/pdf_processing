@echo off
REM Quick Vercel Deployment Setup Script for Windows

echo.
echo 🚀 PDF Processor - Vercel Deployment Setup
echo ==========================================
echo.

REM Check if git is initialized
if exist .git (
    echo ✅ Git repository already initialized
) else (
    echo 📦 Initializing git repository...
    git init
    if errorlevel 1 (
        echo ❌ Git is not installed or not in PATH
        echo Download from: https://git-scm.com/download
        pause
        exit /b 1
    )
    echo ✅ Git initialized
)

echo.
echo 📋 Current git status:
git status

echo.
echo ✅ Setup complete!
echo.
echo 📖 Next steps:
echo 1. Create a GitHub repository at https://github.com/new
echo 2. Copy the GitHub URL
echo 3. Run these commands in PowerShell:
echo    git add .
echo    git commit -m "Initial commit"
echo    git branch -M main
echo    git remote add origin YOUR_GITHUB_URL
echo    git push -u origin main
echo.
echo 4. Then deploy to Vercel at https://vercel.com/new
echo.
echo 📚 For detailed instructions, see VERCEL_DEPLOYMENT.md
echo.
pause
