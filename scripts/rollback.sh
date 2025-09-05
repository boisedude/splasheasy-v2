#!/bin/bash

# SplashEasy V2 - Rollback Helper Script
# Provides safe rollback options for different scenarios

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 SplashEasy V2 - Rollback Helper${NC}"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Run this from the SplashEasy V2 project root${NC}"
    exit 1
fi

echo "Select rollback type:"
echo "1. 🔙 Rollback last commit (soft - keeps changes)"
echo "2. 🔥 Rollback last commit (hard - destroys changes)"
echo "3. 📝 Revert last commit (creates new commit)"
echo "4. 📁 Rollback specific file"
echo "5. 🚀 Rollback Vercel deployment"
echo "6. 🔍 Show recent commits"
echo "7. 🆘 Emergency restore from backup"
echo "0. ❌ Cancel"
echo ""

read -p "Choose option (0-7): " choice

case $choice in
    1)
        echo -e "${YELLOW}⚠️  Soft rollback - keeps your changes in working directory${NC}"
        read -p "Continue? (y/N): " confirm
        if [[ $confirm == [yY] ]]; then
            git reset --soft HEAD~1
            echo -e "${GREEN}✅ Soft rollback complete. Changes are staged.${NC}"
            git status
        fi
        ;;
    
    2)  
        echo -e "${RED}⚠️  DESTRUCTIVE: Hard rollback will permanently delete changes!${NC}"
        read -p "Are you ABSOLUTELY sure? (type 'YES'): " confirm
        if [[ $confirm == "YES" ]]; then
            git reset --hard HEAD~1
            echo -e "${GREEN}✅ Hard rollback complete.${NC}"
            git status
        else
            echo "Cancelled."
        fi
        ;;
        
    3)
        echo -e "${GREEN}Safe revert - creates new commit undoing changes${NC}"
        git revert HEAD --no-edit
        echo -e "${GREEN}✅ Revert complete. Safe to push.${NC}"
        ;;
        
    4)
        echo "Recent changed files:"
        git diff --name-only HEAD~5 HEAD | head -10
        echo ""
        read -p "Enter file path to rollback: " filepath
        if [ -f "$filepath" ]; then
            git checkout HEAD~1 -- "$filepath"
            echo -e "${GREEN}✅ File $filepath rolled back${NC}"
            echo "Run 'git add $filepath && git commit -m \"rollback: restore $filepath\"'"
        else
            echo -e "${RED}❌ File not found: $filepath${NC}"
        fi
        ;;
        
    5)
        echo -e "${BLUE}Rolling back Vercel deployment...${NC}"
        npx vercel --token Rc510TZysBL2kGq2Ke2jD7Wl rollback
        ;;
        
    6)
        echo -e "${BLUE}Recent commits:${NC}"
        git log --oneline -10
        echo ""
        echo "To rollback to a specific commit:"
        echo "git reset --soft <commit-hash>  # Keeps changes"
        echo "git reset --hard <commit-hash>  # Destroys changes"
        ;;
        
    7)
        echo -e "${YELLOW}Emergency restore options:${NC}"
        echo "1. Restore from GitHub (if pushed):"
        echo "   git fetch origin && git reset --hard origin/main"
        echo ""
        echo "2. Clone fresh copy:"
        echo "   git clone https://github.com/[username]/splasheasy-v2.git backup"
        echo ""
        read -p "Restore from GitHub origin/main? (y/N): " restore
        if [[ $restore == [yY] ]]; then
            echo -e "${RED}⚠️  This will destroy all local changes!${NC}"
            read -p "Continue? (type 'YES'): " confirm
            if [[ $confirm == "YES" ]]; then
                git fetch origin
                git reset --hard origin/main
                echo -e "${GREEN}✅ Restored from GitHub${NC}"
            fi
        fi
        ;;
        
    0)
        echo "Cancelled."
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}📚 Rollback Documentation:${NC}"
echo "- Git basics: https://git-scm.com/docs/git-reset"
echo "- Vercel deployments: https://vercel.com/docs/deployments/rollbacks"
echo "- Project docs: docs/CI_CD_PIPELINE.md"