# 🔄 SplashEasy V2 - Rollback Guide

## 📖 Overview

This guide explains how to rollback changes when a future Claude context window makes modifications that you want to undo. Whether it's a single file change, a broken deployment, or complete project changes - this guide covers all scenarios.

---

## ⚡ Quick Reference

| Scenario | Command | Safety Level |
|----------|---------|--------------|
| **Undo last commit (safe)** | `git reset --soft HEAD~1` | 🟢 Safe |
| **Undo last commit (destructive)** | `git reset --hard HEAD~1` | 🔴 Dangerous |
| **Rollback one file** | `git checkout HEAD~1 -- file.tsx` | 🟢 Safe |
| **Rollback deployment** | `npx vercel rollback --token [token]` | 🟡 Medium |
| **Emergency restore** | `git reset --hard origin/main` | 🔴 Nuclear |

---

## 🎯 Common Scenarios

### **Scenario 1: "Claude broke my working code"**

**Problem**: Claude made changes that broke functionality that was working before.

**Solution Options**:

#### **Option A: Safe Rollback (Recommended)**
```bash
# Undo last commit but keep changes for review
git reset --soft HEAD~1

# Review what changed
git diff --staged

# If you want to keep some changes
git reset HEAD specific-file.tsx  # Unstage specific files
git add files-to-keep.tsx          # Stage only what you want
git commit -m "keep: only the good changes"

# Discard unwanted changes
git checkout -- unwanted-file.tsx
```

#### **Option B: Nuclear Option (If you're sure)**
```bash
# ⚠️ WARNING: This permanently deletes all changes!
git reset --hard HEAD~1
```

### **Scenario 2: "I only want to rollback specific files"**

**Problem**: Claude changed multiple files but only some are problematic.

**Solution**:
```bash
# See what files changed recently
git diff --name-only HEAD~3 HEAD

# Rollback specific files to previous versions
git checkout HEAD~1 -- app/page.tsx
git checkout HEAD~2 -- components/CameraCapture.tsx

# Commit the rollback
git add app/page.tsx components/CameraCapture.tsx
git commit -m "rollback: restore working versions of page and camera"
```

### **Scenario 3: "The production deployment is broken"**

**Problem**: Claude's changes were deployed and broke the live site.

**Solution Options**:

#### **Option A: Vercel Dashboard (Easiest)**
1. Go to https://vercel.com/dashboard
2. Select your SplashEasy V2 project
3. Click "Deployments" tab
4. Find the last working deployment
5. Click "..." → "Promote to Production"

#### **Option B: Vercel CLI**
```bash
# Rollback to previous deployment
npx vercel rollback --token Rc510TZysBL2kGq2Ke2jD7Wl

# Or rollback to specific deployment
npx vercel rollback [deployment-url] --token Rc510TZysBL2kGq2Ke2jD7Wl
```

#### **Option C: Git + Auto-Deploy**
```bash
# Rollback code and let CI/CD redeploy
git reset --hard HEAD~1
git push --force-with-lease origin main
# CI/CD will automatically deploy the previous version
```

### **Scenario 4: "I want everything back to yesterday"**

**Problem**: Multiple commits from Claude that you want to completely undo.

**Solution**:
```bash
# Find commits from yesterday
git log --since="yesterday" --oneline
git log --since="2 days ago" --oneline

# Rollback to specific commit (replace abc1234 with actual hash)
git reset --soft abc1234  # Safe - keeps changes
# OR
git reset --hard abc1234  # Destructive - deletes changes

# If you pushed to GitHub, force push (be careful!)
git push --force-with-lease origin main
```

### **Scenario 5: "Total disaster - restore everything"**

**Problem**: Everything is broken and you want to start from the last known good state.

**Solution**:
```bash
# Nuclear option - restore from GitHub (destroys ALL local changes)
git fetch origin
git reset --hard origin/main

# If GitHub also has bad commits, rollback GitHub too
git reset --hard [last-good-commit-hash]
git push --force-with-lease origin main
```

---

## 🛠️ Using the Rollback Helper Script

We've created an interactive script to make rollbacks easier:

```bash
# Run the helper script
./scripts/rollback.sh
```

**Script Options**:
1. 🔙 Soft rollback (safe)
2. 🔥 Hard rollback (destructive) 
3. 📝 Revert commit (creates undo commit)
4. 📁 Rollback specific file
5. 🚀 Rollback Vercel deployment
6. 🔍 Show recent commits
7. 🆘 Emergency restore

---

## 🔍 Investigation Commands

Before rolling back, understand what changed:

### **See Recent Changes**
```bash
# Show last 10 commits
git log --oneline -10

# Show what files changed
git diff --name-only HEAD~5 HEAD

# Show detailed changes
git diff HEAD~1 HEAD

# Show changes in specific file
git log --follow -p -- app/page.tsx
```

### **Compare Versions**
```bash
# Compare current version with 3 commits ago
git diff HEAD~3 HEAD

# Compare specific files
git diff HEAD~1 HEAD app/api/analyze/route.ts
```

### **Find When Something Broke**
```bash
# Use git bisect to find the breaking commit
git bisect start
git bisect bad                    # Current version is broken
git bisect good HEAD~10          # 10 commits ago was working
# Git will checkout commits for you to test
# After each test, run: git bisect good/bad
# Git will find the exact breaking commit
```

---

## 📋 Step-by-Step Rollback Procedures

### **Procedure 1: Safe File Rollback**
```bash
# 1. Identify the problem file
git status
git diff HEAD~1 problematic-file.tsx

# 2. See file history
git log --oneline -- problematic-file.tsx

# 3. Rollback to working version (pick commit hash)
git checkout abc1234 -- problematic-file.tsx

# 4. Test the fix
npm run dev
# Test the functionality

# 5. Commit the rollback
git add problematic-file.tsx
git commit -m "rollback: restore working version of problematic-file.tsx"

# 6. Deploy if needed
git push origin main
```

### **Procedure 2: Rollback Multiple Commits**
```bash
# 1. Review what will be lost
git log --oneline -5
git diff HEAD~3 HEAD

# 2. Create backup branch (just in case)
git branch backup-before-rollback

# 3. Rollback (choose soft or hard)
git reset --soft HEAD~3  # Keeps changes staged
# OR
git reset --hard HEAD~3  # Deletes changes permanently

# 4. If using soft reset, selectively commit what you want
git diff --staged
git reset HEAD unwanted-file.tsx  # Unstage unwanted files
git commit -m "restore: only the good parts"

# 5. Force push if you already pushed the bad commits
git push --force-with-lease origin main
```

### **Procedure 3: Emergency Production Fix**
```bash
# 1. Identify last working deployment
# Check Vercel dashboard or git log

# 2. Quick Vercel rollback (fastest)
npx vercel rollback --token Rc510TZysBL2kGq2Ke2jD7Wl

# 3. Fix the code for permanent solution
git reset --hard [last-working-commit]
git push --force-with-lease origin main

# 4. Verify fix
curl https://your-app-url.vercel.app/api/analyze
```

---

## 🚨 Safety Guidelines

### **Before Any Rollback**
- ✅ Commit any work you want to keep: `git add . && git commit -m "save work in progress"`
- ✅ Create backup branch: `git branch backup-$(date +%Y%m%d-%H%M%S)`
- ✅ Understand what you're rolling back: `git diff HEAD~1 HEAD`

### **Rollback Safety Levels**

#### **🟢 SAFE Operations**
- `git reset --soft HEAD~1` - Keeps all changes
- `git checkout HEAD~1 -- file.tsx` - Only affects one file
- `git revert HEAD` - Creates new commit, doesn't destroy history
- Vercel dashboard rollback - Easy to re-deploy

#### **🟡 MEDIUM Risk Operations**  
- `git push --force-with-lease` - Can overwrite GitHub
- Vercel CLI rollback - Need to redeploy to fix
- Database rollbacks - Can lose data

#### **🔴 DANGEROUS Operations**
- `git reset --hard HEAD~1` - **PERMANENTLY DELETES** uncommitted changes
- `git push --force` - Can overwrite other people's work
- `git reset --hard origin/main` - **DESTROYS ALL** local work

### **Recovery from Mistakes**
If you accidentally ran a dangerous command:

```bash
# Git keeps deleted commits for ~30 days
git reflog  # Shows all recent operations
git reset --hard HEAD@{2}  # Go back to specific reflog entry

# If you have a backup branch
git reset --hard backup-branch-name

# If all else fails and you have GitHub
git fetch origin
git reset --hard origin/main
```

---

## 📚 Common Git Commands Reference

### **Viewing History**
```bash
git log --oneline -10        # Last 10 commits, compact
git log --graph --all        # Visual branch history
git log --since="2 days ago" # Commits from last 2 days
git log --follow file.tsx    # History of specific file
```

### **Comparing Changes**
```bash
git diff HEAD~1 HEAD         # Compare last commit with current
git diff --name-only HEAD~1  # Just show changed file names
git diff branch1..branch2    # Compare branches
git show abc1234            # Show specific commit details
```

### **Undoing Changes**
```bash
git reset --soft HEAD~1      # Undo commit, keep changes staged
git reset --mixed HEAD~1     # Undo commit, unstage changes
git reset --hard HEAD~1      # Undo commit, delete changes
git revert HEAD             # Create new commit that undoes changes
git checkout -- file.tsx    # Discard changes to file
```

### **Branch Operations**
```bash
git branch backup-name       # Create backup branch
git checkout -b new-branch   # Create and switch to new branch
git branch -D branch-name    # Delete branch (force)
git checkout main           # Switch to main branch
```

---

## 🔧 SplashEasy V2 Specific Rollbacks

### **Rolling Back Core Components**

#### **Camera Component Issues**
```bash
# Rollback camera component to working version
git checkout HEAD~1 -- components/features/camera/CameraCapture.tsx
git add components/features/camera/CameraCapture.tsx
git commit -m "rollback: restore working camera component"
```

#### **API Route Problems** 
```bash
# Rollback API route
git checkout HEAD~1 -- app/api/analyze/route.ts
npm run build  # Test the build
git add app/api/analyze/route.ts
git commit -m "rollback: restore working API route"
```

#### **Homepage Issues**
```bash
# Rollback homepage
git checkout HEAD~1 -- app/page.tsx
git add app/page.tsx  
git commit -m "rollback: restore working homepage"
```

### **Environment & Configuration Rollbacks**

#### **Package Dependencies**
```bash
# Rollback package.json and reinstall
git checkout HEAD~1 -- package.json package-lock.json
npm ci  # Clean install from lock file
```

#### **Configuration Files**
```bash
# Rollback config files
git checkout HEAD~1 -- next.config.js tailwind.config.js tsconfig.json
npm run build  # Test configuration
```

#### **Vercel Configuration**
```bash
# Rollback Vercel config
git checkout HEAD~1 -- vercel.json
git add vercel.json
git commit -m "rollback: restore vercel configuration"
npx vercel --prod --token Rc510TZysBL2kGq2Ke2jD7Wl  # Redeploy
```

---

## 📞 When Things Go Really Wrong

### **Nuclear Recovery Options**

#### **Option 1: Fresh Clone**
```bash
# Clone fresh copy from GitHub
cd ..
git clone https://github.com/your-username/splasheasy-v2.git fresh-copy
cd fresh-copy
git checkout [last-known-good-commit]

# Replace broken project
cd ..
mv SplashEasy-V2 broken-backup
mv fresh-copy SplashEasy-V2
```

#### **Option 2: Reset Everything**
```bash
# This destroys ALL local changes
git fetch origin
git reset --hard origin/main
git clean -fdx  # Remove all untracked files
npm ci  # Clean install
```

#### **Option 3: Selective Recovery**
```bash
# Save current work
git add .
git commit -m "save broken state"

# Go back to working version
git reset --hard [working-commit-hash]

# Cherry-pick any good changes
git cherry-pick [commit-with-good-changes]
```

---

## 📋 Rollback Checklist

### **Before Rolling Back**
- [ ] Identify exactly what broke and when
- [ ] Create backup: `git branch backup-$(date +%Y%m%d-%H%M%S)`
- [ ] Save any work in progress: `git add . && git commit -m "wip"`
- [ ] Review what will be lost: `git diff HEAD~1 HEAD`

### **During Rollback**
- [ ] Use safest option first (`--soft` over `--hard`)
- [ ] Test the rollback: `npm run build && npm run lint`
- [ ] Verify functionality: `npm run dev`
- [ ] Check API endpoints: `curl http://localhost:3000/api/analyze`

### **After Rollback**
- [ ] Commit rollback: `git add . && git commit -m "rollback: description"`
- [ ] Push if needed: `git push origin main`
- [ ] Verify production: Check live URL
- [ ] Update documentation if needed

---

## 🎯 Summary

**Remember the Golden Rule**: Always prefer safe operations over destructive ones!

1. **Start Safe**: Use `git reset --soft` or `git checkout -- file`
2. **Test First**: Always test after rollback before pushing
3. **Backup Everything**: Create branches before major rollbacks
4. **Use the Script**: `./scripts/rollback.sh` provides guided options
5. **When in Doubt**: Ask for help rather than risk data loss

**Emergency Contact**: If you're completely stuck, the `git reflog` command can often save you by showing every operation you've done recently.

---

## 📚 Additional Resources

- **Git Documentation**: https://git-scm.com/docs
- **Git Reset Explained**: https://git-scm.com/docs/git-reset
- **Vercel Deployments**: https://vercel.com/docs/deployments/rollbacks
- **Project CI/CD**: `docs/CI_CD_PIPELINE.md`
- **Rollback Script**: `scripts/rollback.sh`

**Remember: Git is forgiving - most "disasters" can be recovered from. Stay calm and use the right tools!** 🚀