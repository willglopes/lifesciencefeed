#!/bin/bash
# Quick Vercel Deployment Commands

echo "🚀 Vercel Deployment Helper Script"
echo "=================================="

# Function to prepare for deployment
prepare_deployment() {
    echo "📋 Step 1: Preparing for deployment..."
    
    # Test build
    echo "Testing build..."
    if npm run build; then
        echo "✅ Build successful!"
    else
        echo "❌ Build failed! Fix errors before deploying."
        exit 1
    fi
    
    # Check environment file
    if [ ! -f ".env.example" ]; then
        echo "Creating .env.example..."
        cat > .env.example << EOF
NEXT_PUBLIC_STRAPI_URL=https://your-strapi-domain.com
EOF
        echo "✅ Created .env.example"
    fi
    
    echo "✅ Deployment preparation complete!"
}

# Function to push to GitHub
push_to_github() {
    echo "📁 Step 2: Pushing to GitHub..."
    
    # Check if git is initialized
    if [ ! -d ".git" ]; then
        echo "Initializing git..."
        git init
    fi
    
    # Add all files
    git add .
    
    # Commit
    echo "Enter commit message (or press Enter for default):"
    read commit_message
    if [ -z "$commit_message" ]; then
        commit_message="Deploy to Vercel - $(date)"
    fi
    
    git commit -m "$commit_message"
    
    # Check if remote exists
    if ! git remote get-url origin > /dev/null 2>&1; then
        echo "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git):"
        read repo_url
        git remote add origin "$repo_url"
    fi
    
    # Push to GitHub
    git branch -M main
    git push -u origin main
    
    echo "✅ Code pushed to GitHub!"
}

# Function to show Vercel setup instructions
show_vercel_instructions() {
    echo "🔗 Step 3: Deploy to Vercel"
    echo "=========================="
    echo ""
    echo "Now follow these steps:"
    echo "1. Go to https://vercel.com"
    echo "2. Sign up with GitHub"
    echo "3. Click 'New Project'"
    echo "4. Import your repository"
    echo "5. Add environment variable:"
    echo "   Name: NEXT_PUBLIC_STRAPI_URL"
    echo "   Value: https://your-strapi-domain.com"
    echo "6. Click 'Deploy'"
    echo ""
    echo "🎉 Your site will be live in 2-3 minutes!"
}

# Function to check deployment status
check_deployment() {
    echo "🔍 Deployment Checklist"
    echo "======================"
    echo ""
    echo "After deployment, test these URLs:"
    echo "Replace 'your-site.vercel.app' with your actual Vercel URL"
    echo ""
    echo "✅ Homepage: https://your-site.vercel.app"
    echo "✅ Therapy area: https://your-site.vercel.app/therapy-area/cardiology"
    echo "✅ Disease area: https://your-site.vercel.app/disease-area/heart-failure"
    echo "✅ Category: https://your-site.vercel.app/category/clinical-trials"
    echo ""
    echo "Check that:"
    echo "- Pages load correctly"
    echo "- Articles appear from Strapi"
    echo "- Images load properly"
    echo "- Navigation works"
    echo "- Mobile version looks good"
}

# Function to show environment variable setup
show_env_setup() {
    echo "⚙️ Environment Variables Setup"
    echo "=============================="
    echo ""
    echo "In Vercel dashboard, add this environment variable:"
    echo ""
    echo "Name: NEXT_PUBLIC_STRAPI_URL"
    echo "Value: [Your actual Strapi URL]"
    echo "Environment: Production, Preview, Development (select all)"
    echo ""
    echo "Common Strapi URLs:"
    echo "- Railway: https://your-app.railway.app"
    echo "- Render: https://your-app.onrender.com"
    echo "- Heroku: https://your-app.herokuapp.com"
    echo "- Custom domain: https://api.yourdomain.com"
}

# Function to show troubleshooting tips
show_troubleshooting() {
    echo "🚨 Troubleshooting Common Issues"
    echo "================================"
    echo ""
    echo "❌ Build fails:"
    echo "   - Run 'npm run build' locally to see errors"
    echo "   - Fix TypeScript/ESLint errors"
    echo "   - Check all imports are correct"
    echo ""
    echo "❌ Images not loading:"
    echo "   - Check next.config.js has correct Strapi domain"
    echo "   - Verify NEXT_PUBLIC_STRAPI_URL environment variable"
    echo "   - Ensure Strapi allows CORS from Vercel domain"
    echo ""
    echo "❌ Articles not loading:"
    echo "   - Test Strapi URL directly in browser"
    echo "   - Check browser console for errors"
    echo "   - Verify Strapi is publicly accessible"
    echo ""
    echo "❌ 404 on dynamic routes:"
    echo "   - Check file structure: pages/[section]/[slug].tsx"
    echo "   - Verify getStaticPaths is working"
    echo "   - Test routes locally first"
}

# Main menu
case "$1" in
    "prepare")
        prepare_deployment
        ;;
    "push")
        push_to_github
        ;;
    "instructions")
        show_vercel_instructions
        ;;
    "check")
        check_deployment
        ;;
    "env")
        show_env_setup
        ;;
    "troubleshoot")
        show_troubleshooting
        ;;
    "all")
        prepare_deployment
        echo ""
        push_to_github
        echo ""
        show_vercel_instructions
        ;;
    *)
        echo "Vercel Deployment Helper"
        echo "======================="
        echo ""
        echo "Usage: $0 {prepare|push|instructions|check|env|troubleshoot|all}"
        echo ""
        echo "Commands:"
        echo "  prepare      - Test build and prepare files"
        echo "  push         - Push code to GitHub"
        echo "  instructions - Show Vercel setup steps"
        echo "  check        - Show deployment checklist"
        echo "  env          - Show environment variable setup"
        echo "  troubleshoot - Show troubleshooting tips"
        echo "  all          - Run prepare + push + instructions"
        echo ""
        echo "Quick start: $0 all"
        exit 1
        ;;
esac

