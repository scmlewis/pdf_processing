#!/bin/bash
# Quick Vercel Deployment Setup Script

echo "🚀 PDF Processor - Vercel Deployment Setup"
echo "=========================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    echo "   Download from: https://git-scm.com/download"
    exit 1
fi

# Check if already initialized
if [ -d .git ]; then
    echo "✅ Git repository already initialized"
else
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git initialized"
fi

# Check for uncommitted changes
echo ""
echo "📋 Current git status:"
git status

echo ""
echo "✅ Setup complete!"
echo ""
echo "📖 Next steps:"
echo "1. Create a GitHub repository at https://github.com/new"
echo "2. Copy the GitHub URL"
echo "3. Run these commands:"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git branch -M main"
echo "   git remote add origin YOUR_GITHUB_URL"
echo "   git push -u origin main"
echo ""
echo "4. Then deploy to Vercel at https://vercel.com/new"
echo ""
echo "📚 For detailed instructions, see VERCEL_DEPLOYMENT.md"
