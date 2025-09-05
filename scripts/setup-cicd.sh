#!/bin/bash

# SplashEasy V2 - CI/CD Setup Script
# This script helps configure CI/CD pipeline for the project

set -e

echo "🚀 SplashEasy V2 - CI/CD Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not in a Git repository${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo -e "${GREEN}✅ Git repository detected${NC}"

# Check if GitHub Actions workflow exists
if [ -f ".github/workflows/ci.yml" ]; then
    echo -e "${GREEN}✅ GitHub Actions workflow exists${NC}"
else
    echo -e "${RED}❌ GitHub Actions workflow missing${NC}"
    echo "Please ensure .github/workflows/ci.yml exists"
    exit 1
fi

# Check if package.json has required scripts
echo "🔍 Checking package.json scripts..."

if grep -q '"build"' package.json; then
    echo -e "${GREEN}✅ Build script found${NC}"
else
    echo -e "${RED}❌ Build script missing${NC}"
fi

if grep -q '"lint"' package.json; then
    echo -e "${GREEN}✅ Lint script found${NC}"
else
    echo -e "${RED}❌ Lint script missing${NC}"
fi

if grep -q '"dev"' package.json; then
    echo -e "${GREEN}✅ Dev script found${NC}"
else
    echo -e "${RED}❌ Dev script missing${NC}"
fi

# Check vercel.json configuration
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✅ Vercel configuration exists${NC}"
else
    echo -e "${YELLOW}⚠️  Vercel configuration missing${NC}"
fi

echo ""
echo "📋 Required GitHub Secrets:"
echo "=========================="
echo "Repository Settings → Secrets and Variables → Actions"
echo ""
echo "🔐 Vercel Configuration:"
echo "  VERCEL_TOKEN=Rc510TZysBL2kGq2Ke2jD7Wl"
echo "  VERCEL_ORG_ID=ZShRkySRuZw2wNAqwPeaCqK6"
echo "  VERCEL_PROJECT_ID=[Get from Vercel Dashboard]"
echo ""
echo "🔐 Application Environment:"
echo "  NEXT_PUBLIC_SUPABASE_URL=https://xblhoadgkohoxjpzjlsr.supabase.co"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=[Your Supabase Anon Key]"
echo "  OPENAI_API_KEY=[Your OpenAI API Key]"
echo "  SUPABASE_SERVICE_ROLE_KEY=[Your Supabase Service Key]"
echo ""

# Check current git branch
current_branch=$(git branch --show-current)
echo "📍 Current branch: ${current_branch}"

if [ "$current_branch" = "main" ]; then
    echo -e "${GREEN}✅ On main branch (production deployments)${NC}"
elif [ "$current_branch" = "develop" ]; then
    echo -e "${GREEN}✅ On develop branch (staging deployments)${NC}"
else
    echo -e "${YELLOW}⚠️  On feature branch: ${current_branch}${NC}"
    echo "   Push to 'main' for production or 'develop' for staging"
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Configure GitHub repository secrets (above)"
echo "2. Get VERCEL_PROJECT_ID from Vercel dashboard"
echo "3. Push to main/develop branch to trigger CI/CD"
echo "4. Monitor pipeline at: https://github.com/[username]/[repo]/actions"
echo ""

# Test local build
echo "🧪 Testing local build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Local build successful${NC}"
else
    echo -e "${RED}❌ Local build failed${NC}"
    echo "Fix build issues before pushing to repository"
    exit 1
fi

# Test linting
echo "🧪 Testing linting..."
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Linting passed${NC}"
else
    echo -e "${RED}❌ Linting failed${NC}"
    echo "Fix linting issues before pushing to repository"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 CI/CD Setup Complete!${NC}"
echo "Your pipeline is ready for automated testing and deployment."
echo ""
echo "📚 Documentation: docs/CI_CD_PIPELINE.md"
echo "🚀 Live URL: https://splasheasy-v2-44a6wr80d-michael-coopers-projects-69eead79.vercel.app"