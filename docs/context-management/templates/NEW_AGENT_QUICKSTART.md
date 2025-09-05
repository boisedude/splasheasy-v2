# New Agent Quick Start Guide
**Get Up to Speed in Under 5 Minutes**

---

## 🚀 IMMEDIATE CONTEXT (Read First - 2 Minutes)

### **What Am I Working On?**
**SplashEasy V2** - AI-powered water testing app that lets users photograph test strips and get instant, accurate water chemistry analysis and treatment recommendations.

### **What Phase Are We In?**
Check **PROJECT_STATUS.md** for current phase, but likely one of:
- **Phase 1**: Core Infrastructure (auth, database, APIs)
- **Phase 2**: Computer Vision (GPT-4 Vision integration)
- **Phase 3**: User Interface (camera, results display)
- **Phase 4+**: Testing, launch, optimization

### **What's My Immediate Goal?**
Check **NEXT_ACTIONS.md** for prioritized tasks. Focus on **🔥 CRITICAL** and **⚡ HIGH** priority items first.

### **Any Blockers?**
Check **CURRENT_BLOCKERS.md** - if there are active blockers, resolve those before starting new work.

---

## ⚡ RAPID CONTEXT LOADING (3 Minutes)

### **Step 1: Project Status Check (30 seconds)**
```bash
# Navigate to project
cd /mnt/d/Projects/SplashEasy-V2

# Check if project builds (if development started)
npm run dev  # Should start without errors if setup
```

### **Step 2: Read Essential Status Files (2 minutes)**
Read these files **IN ORDER**:
1. **PROJECT_STATUS.md** - Current state and phase progress
2. **NEXT_ACTIONS.md** - Exactly what to work on next  
3. **CURRENT_BLOCKERS.md** - Any issues preventing progress

### **Step 3: Understand Context (30 seconds)**
Read **LAST_SESSION_SUMMARY.md** to understand:
- What the previous agent accomplished
- Current state of the project
- Any important decisions or discoveries

---

## 🎯 WORK SESSION STARTUP (30 seconds)

### **Create Your Session Log**
```bash
# Create session file (replace with current date and session number)
touch docs/context-management/sessions/$(date +%Y-%m-%d)-session-N.md
```

### **Session Log Template**
Copy this into your new session file:

```markdown
# Session Log - [DATE] - Session [N]

## Session Goals
- [Primary goal based on NEXT_ACTIONS.md]
- [Secondary goals if time permits]

## Starting State
- Project Status: [From PROJECT_STATUS.md]
- Last Completed: [From LAST_SESSION_SUMMARY.md]
- Blockers: [From CURRENT_BLOCKERS.md]

## Work Log
### [TIMESTAMP] - Starting Work
- [Document what you're working on]

### [TIMESTAMP] - [Task/Decision]
- [Keep updating as you work]

## Session End Summary
[Fill this out at the end of your session]
```

---

## 📋 QUICK REFERENCE

### **Key File Locations**
```
Context Management:
└── docs/context-management/status/
    ├── PROJECT_STATUS.md        ← Current state
    ├── NEXT_ACTIONS.md         ← What to work on  
    ├── CURRENT_BLOCKERS.md     ← Issues to resolve
    └── DECISION_LOG.md         ← Why we made choices

Technical Documentation:
└── docs/
    ├── specs/                  ← Requirements & features
    ├── architecture/           ← Technical design
    └── planning/              ← Roadmaps & strategy
```

### **Essential Commands**
```bash
# Navigate to project
cd /mnt/d/Projects/SplashEasy-V2

# Start development server (if setup)
npm run dev

# Build project (if setup)
npm run build

# Install dependencies (if needed)
npm install

# Create new Vercel project (if not setup)
npx vercel --confirm
```

### **Technology Stack Quick Reference**
- **Platform**: Vercel (hosting, AI SDK, database)
- **Framework**: Next.js 15 with App Router + TypeScript
- **Database**: Vercel Postgres with Drizzle ORM
- **Auth**: Clerk for user management
- **AI**: GPT-4 Vision via Vercel AI SDK
- **UI**: shadcn/ui components + v0.dev generation

---

## 🚨 CRITICAL WARNINGS

### **Don't Start Without Reading**
- ❌ **Don't code without checking CURRENT_BLOCKERS.md**
- ❌ **Don't implement features not in NEXT_ACTIONS.md**
- ❌ **Don't change architecture without documenting in DECISION_LOG.md**

### **Phase-Specific Warnings**
- **Phase 1**: Don't attempt computer vision yet - focus on foundation
- **Phase 2**: Don't build UI yet - focus on AI accuracy  
- **Phase 3**: Don't optimize for production yet - focus on user experience
- **Phase 4+**: Follow testing and launch protocols carefully

### **Technical Warnings**
- Always use **absolute file paths** in documentation
- Test changes before documenting them as complete
- Keep TypeScript errors at zero - don't ignore type issues
- Database changes require migration planning

---

## 🎯 COMMON SCENARIOS

### **"I'm Starting Phase 1" (Core Infrastructure)**
1. Read **technical-requirements.md** for what to build
2. Review **system-design.md** for implementation details
3. Follow **development-roadmap.md** Week 3-4 tasks
4. Focus on: Vercel setup → Auth → Database → APIs

### **"I'm Starting Phase 2" (Computer Vision)**
1. Read **computer-vision-plan.md** thoroughly (680 lines)
2. Ensure Phase 1 is completely working first
3. Start with basic GPT-4 Vision integration
4. Focus on accuracy validation and confidence scoring

### **"I'm Starting Phase 3" (User Interface)**
1. Review **system-design.md** UI component architecture
2. Use v0.dev to generate camera and results components
3. Focus on mobile-first PWA experience
4. Integrate with Phase 2 computer vision APIs

### **"I'm Fixing Bugs/Issues"**
1. Check if issue is documented in **CURRENT_BLOCKERS.md**
2. Update blocker status with resolution attempts
3. Document root cause and fix in session log
4. Update relevant architecture/requirements docs if needed

### **"I'm Near Context Window Limit"**
1. **IMMEDIATELY** update all status files with current work
2. Complete session log with detailed handoff notes
3. Document exactly what you were working on and next steps
4. Leave project in stable, runnable state

---

## 📊 SESSION SUCCESS CHECKLIST

### **During Your Session** ✅
- [ ] Updated PROJECT_STATUS.md as work progressed
- [ ] Kept session log current with decisions and progress
- [ ] Tested that changes work before marking complete
- [ ] Updated NEXT_ACTIONS.md with any new priorities
- [ ] Added any blockers discovered to CURRENT_BLOCKERS.md

### **Before Session End** ✅
- [ ] Updated LAST_SESSION_SUMMARY.md with session achievements
- [ ] Documented all decisions made in DECISION_LOG.md
- [ ] Left project in stable, working state
- [ ] Created clear handoff notes for next agent
- [ ] Pushed any code changes to version control

---

## 🎮 QUICK COMMANDS FOR COMMON TASKS

### **Status Updates**
```bash
# Quick status check
echo "Phase: [Current Phase]" >> docs/context-management/status/PROJECT_STATUS.md
echo "Progress: [What you completed]" >> docs/context-management/status/PROJECT_STATUS.md

# Update next actions
echo "- [New task]: [Description]" >> docs/context-management/status/NEXT_ACTIONS.md
```

### **Session Documentation**
```bash
# Quick session update
echo "### $(date +%H:%M) - [Task Name]" >> docs/context-management/sessions/[your-session-file].md
echo "- [What you did]" >> docs/context-management/sessions/[your-session-file].md
```

### **Project Health Check**
```bash
# Verify project works
cd /mnt/d/Projects/SplashEasy-V2
npm run build  # Should succeed if setup
npm run dev    # Should start development server
```

---

## 🆘 EMERGENCY PROCEDURES

### **If Context Window Is Full**
1. **STOP** whatever you're working on
2. **IMMEDIATELY** update PROJECT_STATUS.md with current state
3. Document exactly what you were doing in session log
4. Mark any incomplete work clearly
5. Leave project in stable state (commit or revert changes)

### **If You Encounter Major Blocker**
1. Document in CURRENT_BLOCKERS.md with priority level
2. Include attempted solutions and impact assessment
3. Update NEXT_ACTIONS.md to reflect blocker priority
4. Consider if this affects project timeline or scope

### **If Something Breaks**
1. Don't panic - check Git history for recent changes
2. Test if problem exists in clean environment
3. Document issue in CURRENT_BLOCKERS.md
4. Revert to last known working state if necessary

---

**🎯 Remember: Speed is important, but accuracy and documentation are critical for project success!**

*Quick Start Guide - Always Current*