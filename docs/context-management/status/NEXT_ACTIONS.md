# Next Actions - Priority Queue
**SplashEasy V2 - Immediate Tasks for Next Agent**

---

## 🔥 CRITICAL (Do First - Session Blockers)

### **1. Execute Database Schema in Supabase**
**Priority**: CRITICAL - All features depend on database structure  
**Owner**: Next agent (Feature Development start)
**No Timeline Pressure**: Quality over speed, solo development pace

**Steps to Complete**:
```bash
# 1. Open Supabase Dashboard
# Go to https://supabase.com/dashboard/project/xblhoadgkohoxjpzjlsr
# Navigate to SQL Editor

# 2. Copy and execute schema
cat supabase-schema.sql
# Copy entire contents, paste in SQL Editor, and run

# 3. Verify tables created
# Check Tables tab - should see: profiles, units, water_tests, maintenance_reminders

# 4. Test basic functionality
# Verify RLS policies are active
# Test that auth.users trigger creates profiles automatically
```

**Success Criteria**:
- [ ] All 4 tables created (profiles, units, water_tests, maintenance_reminders)
- [ ] RLS policies active on all tables
- [ ] Automatic profile creation trigger working
- [ ] Maintenance reminder next_due calculation trigger working
- [ ] Can query tables through Supabase dashboard

**Dependencies**: None - Foundation is complete
**Blockers**: None
**Notes**: This unlocks all app functionality. Schema file is ready to execute.

---

## ⚡ HIGH (Next Priority Features)

### **2. Add OpenAI API Key for GPT-4 Vision**
**Priority**: HIGH - Required for AI water analysis  
**Prerequisites**: Database schema executed

**Steps to Complete**:
```bash
# 1. Get OpenAI API Key
# Visit https://platform.openai.com/api-keys
# Create new secret key with GPT-4 Vision access

# 2. Add to environment variables
# Update .env.local:
OPENAI_API_KEY=sk-your-openai-key-here

# 3. Test API connectivity
# Create simple test to verify GPT-4 Vision access
# Use Vercel AI SDK to make test call
```

**Files to Create/Modify**:
- `.env.local` - Add OpenAI API key
- `/app/api/test-ai/route.ts` - Test GPT-4 Vision connectivity
- Test API call to verify billing and access

**Success Criteria**:
- [ ] OpenAI API key configured and working
- [ ] GPT-4 Vision model accessible via Vercel AI SDK
- [ ] Test image analysis returns structured data
- [ ] API billing and rate limits confirmed

### **3. Build Camera Interface for Test Strip Photography**
**Priority**: HIGH - Core user interaction  
**Prerequisites**: OpenAI API key configured

**Steps to Complete**:
```bash
# 1. Create camera components
# components/camera/CameraCapture.tsx - WebRTC camera interface
# components/camera/ImagePreview.tsx - Show captured image
# components/camera/StripAlignment.tsx - Guide positioning

# 2. Implement camera functionality
# WebRTC getUserMedia API
# Image capture and preview
# Basic image validation (size, quality)

# 3. Focus on test strip specific needs
# Guide for AquaChek and Taylor strips
# Lighting and positioning recommendations
```

**Camera Component Architecture**:
```typescript
// Recommended structure:
components/camera/
├── CameraCapture.tsx      # Main camera interface
├── ImagePreview.tsx       # Show captured image  
├── StripAlignment.tsx     # Visual positioning guide
├── TestStripGuide.tsx     # AquaChek/Taylor specific guides
└── CameraControls.tsx     # Capture, retake, analyze buttons
```

**Success Criteria**:
- [ ] Camera opens and displays live video feed
- [ ] Can capture high-quality images suitable for analysis
- [ ] Image preview shows captured test strip clearly
- [ ] Visual guides help users position strips correctly
- [ ] Works on mobile devices (primary use case)

### **4. Implement GPT-4 Vision Analysis**
**Priority**: HIGH - Core AI functionality
**Prerequisites**: Camera interface working

**Steps to Complete**:
```bash
# 1. Create AI analysis API route
# /app/api/analyze-strip/route.ts
# Accept image, return structured water chemistry data

# 2. Implement structured output parsing
# Use Zod schemas for validation
# Parse GPT-4 Vision responses into typed data

# 3. Add confidence scoring and validation
# Return confidence scores for each reading
# Implement fallback logic for low confidence
```

**API Implementation**:
```typescript
// /app/api/analyze-strip/route.ts
1. Receive image from camera
2. Validate image quality and format
3. Send to GPT-4 Vision with structured prompt
4. Parse response using Zod schema validation
5. Return readings + confidence scores
6. Log results for accuracy tracking
```

**Success Criteria**:
- [ ] API accepts images and returns structured chemistry data
- [ ] Confidence scores indicate AI reliability
- [ ] Supports AquaChek and Taylor test strips
- [ ] Handles errors gracefully (bad images, API failures)
- [ ] Response time under 10 seconds

---

## 📋 MEDIUM (Build Out User Experience)

### **5. Create Manual Color Selection Fallback**
**Priority**: MEDIUM - Essential backup when AI fails
**Prerequisites**: AI analysis implemented

**Implementation**:
- Color palette interface for manual strip reading
- Parameter-by-parameter color selection
- Same calculation engine as AI analysis
- Seamless fallback when confidence < 80%

### **6. Build Guest User Testing Flow**
**Priority**: MEDIUM - Core user journey
**Prerequisites**: Camera + AI + Manual fallback ready

**User Flow**:
1. Landing page → Start testing (no signup)
2. Camera interface → Capture strip
3. AI analysis → Results display
4. Registration prompt to save results
5. Basic dosing recommendations

### **7. Implement User Registration and Unit Creation**
**Priority**: MEDIUM - Conversion and persistence
**Prerequisites**: Guest flow working

**Features**:
- Supabase auth integration (already configured)
- Unit creation form (name, type, volume, sanitizer)
- Test history storage and retrieval
- Basic profile management

---

## 💡 LOW (Polish and Enhancement)

### **8. Add Maintenance Reminders**
**Priority**: LOW - Value-add feature
**Prerequisites**: User registration working

**Features**:
- Create recurring maintenance tasks
- Calculate next due dates automatically
- Simple reminder notifications
- Mark tasks as complete

### **9. Build Dashboard and History**
**Priority**: LOW - User engagement
**Prerequisites**: Test storage working

**Features**:
- Dashboard with recent tests
- Water chemistry trends over time
- Unit management interface
- Test history with filtering

---

## 🎯 Session Success Definition

### **Minimum Viable Progress**
- [ ] Database schema executed successfully
- [ ] Camera captures test strip images
- [ ] AI analysis returns water chemistry data
- [ ] Basic guest testing flow works end-to-end

### **Ideal Session Outcome**
- [ ] Full guest user flow: Camera → AI → Manual fallback → Results
- [ ] User registration and unit creation
- [ ] Test history storage working
- [ ] Mobile-optimized interface

### **Stretch Goals**
- [ ] Dosing recommendations display correctly
- [ ] Basic maintenance reminders
- [ ] Performance optimized for mobile

---

## 📞 Context for Success

### **Available Resources**
- ✅ Complete database schema ready to execute
- ✅ TypeScript types and query helpers ready
- ✅ Water chemistry calculation engine complete
- ✅ Supabase configured and connected
- ✅ Vercel AI SDK installed and ready
- ✅ shadcn/ui components available

### **Key Implementation Files**
- `supabase-schema.sql` - Ready to execute database structure
- `lib/types/database.ts` - Complete TypeScript definitions
- `lib/database/queries.ts` - Ready-to-use query helpers
- `lib/chemistry/calculator.ts` - Water analysis and dosing logic

### **Architectural Guidance**
- Keep consumer experience pure and simple
- Mobile-first responsive design
- Guest mode should work without barriers
- AI is primary, manual is fallback
- Collect user feedback on AI accuracy

---

**🚀 Next agent inherits a complete foundation ready for feature development!**

*Updated: September 4, 2025 - Session 2 → 3 Handoff*