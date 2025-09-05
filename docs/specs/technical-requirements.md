# Technical Requirements Specification

**SplashEasy V2 - AI-Powered Water Testing Platform**

---

## 1. System Overview

SplashEasy V2 is a progressive web application that uses computer vision to analyze water test strips, providing instant water chemistry analysis and treatment recommendations for pools and hot tubs.

### 1.1 Dual Persona Architecture

**CRITICAL ARCHITECTURAL PRINCIPLE**: The system serves two distinct personas through completely separate interfaces:

#### 1.1.1 Consumer Application (Free Users)

- **Purpose**: Pure, simple water testing tool for residential pool owners
- **Experience**: Clean, consumer-focused UI with zero business/commercial features
- **Access**: Public web application, guest mode available
- **Features**: AI water analysis, manual testing, unit management, maintenance reminders

#### 1.1.2 Partner Portal (Pool Service Companies - Paid)

- **Purpose**: Business management platform for pool service professionals
- **Experience**: Separate portal/domain with comprehensive business tools
- **Access**: Subscription-based access via partners.splasheasy.com
- **Features**: Customer management, service scheduling, chemical sales, territory management

#### 1.1.3 Separation Requirements

- **REQ-ARCH-001**: Consumer app SHALL work completely independently of partner system
- **REQ-ARCH-002**: Consumer users SHALL never see partner-related features or branding
- **REQ-ARCH-003**: Partner features SHALL be developed as separate codebase or isolated modules
- **REQ-ARCH-004**: API endpoints SHALL be segregated between consumer and partner functionality
- **REQ-ARCH-005**: Consumer app user experience SHALL remain pure regardless of partner system status

## 2. Functional Requirements

### 2.1 Core Water Testing Features

#### 2.1.1 Computer Vision Strip Analysis

- **REQ-CV-001**: System SHALL capture test strip images via mobile camera
- **REQ-CV-002**: System SHALL analyze strip colors using GPT-4 Vision via Vercel AI SDK
- **REQ-CV-003**: System SHALL extract chemical readings (pH, chlorine, alkalinity, etc.)
- **REQ-CV-004**: System SHALL provide confidence scores for each reading
- **REQ-CV-005**: System SHALL complete analysis within 5 seconds of image capture (aspirational)
- **REQ-CV-006**: System SHALL handle various lighting conditions and strip orientations
- **REQ-CV-007**: System SHALL validate strip type compatibility before analysis
- **REQ-CV-008**: System SHALL support AquaChek and Taylor test strips initially
- **REQ-CV-009**: System SHALL collect user feedback on AI accuracy ("Did we get it right?")
- **REQ-CV-010**: System SHALL track accuracy metrics for continuous improvement

#### 2.1.2 Manual Test Entry & Color Selection

- **REQ-MTE-001**: System SHALL support manual numeric entry for all parameters
- **REQ-MTE-002**: System SHALL provide visual color palette for strip color matching
- **REQ-MTE-003**: System SHALL allow users to select colors that match their test strip
- **REQ-MTE-004**: System SHALL automatically calculate readings from color selections
- **REQ-MTE-005**: System SHALL provide input validation with reasonable ranges
- **REQ-MTE-006**: System SHALL offer guided help for manual readings
- **REQ-MTE-007**: System SHALL remember user's preferred test method (AI vs manual)
- **REQ-MTE-008**: System SHALL provide seamless fallback when AI analysis fails

#### 2.1.3 Results & Recommendations

- **REQ-RES-001**: System SHALL display results with clear visual status indicators
- **REQ-RES-002**: System SHALL provide specific dosing recommendations by chemical
- **REQ-RES-003**: System SHALL calculate dosing based on unit volume and current readings
- **REQ-RES-004**: System SHALL include safety warnings for chemical handling
- **REQ-RES-005**: System SHALL suggest retest timing based on treatments applied
- **REQ-RES-006**: System SHALL explain the reasoning behind each recommendation

### 2.2 Unit Management

#### 2.2.1 Multi-Unit Support

- **REQ-UNIT-001**: System SHALL support unlimited units per user
- **REQ-UNIT-002**: System SHALL allow users to define unit specifications (volume, type, equipment)
- **REQ-UNIT-003**: System SHALL provide unit selector for test entry
- **REQ-UNIT-004**: System SHALL remember last selected unit per user
- **REQ-UNIT-005**: System SHALL support unit favoriting/starring

#### 2.2.2 Unit Configuration

- **REQ-CONFIG-001**: System SHALL capture unit volume in gallons
- **REQ-CONFIG-002**: System SHALL support unit types (pool, spa, hot tub)
- **REQ-CONFIG-003**: System SHALL allow sanitizer type selection (chlorine, bromine, salt)
- **REQ-CONFIG-004**: System SHALL store equipment details for maintenance scheduling

### 2.3 Historical Tracking & Analytics

#### 2.3.1 Test History

- **REQ-HIST-001**: System SHALL store all test results with timestamps
- **REQ-HIST-002**: System SHALL associate tests with specific units
- **REQ-HIST-003**: System SHALL provide chronological test listing
- **REQ-HIST-004**: System SHALL support test result editing within 24 hours
- **REQ-HIST-005**: System SHALL allow test deletion by owners

#### 2.3.2 Trend Analysis

- **REQ-TREND-001**: System SHALL display parameter trends over time
- **REQ-TREND-002**: System SHALL provide visual charts for key parameters
- **REQ-TREND-003**: System SHALL identify recurring issues and patterns
- **REQ-TREND-004**: System SHALL suggest preventive actions based on trends

### 2.4 User Management & Authentication

#### 2.4.1 Account Management

- **REQ-AUTH-001**: System SHALL support email/password authentication via Supabase Auth
- **REQ-AUTH-002**: System SHALL support social login (Google, Apple) via Supabase Auth
- **REQ-AUTH-003**: System SHALL support magic link authentication via Supabase Auth
- **REQ-AUTH-004**: System SHALL provide user profile management
- **REQ-AUTH-005**: System SHALL support account deletion with GDPR compliance

#### 2.4.2 Guest Mode

- **REQ-GUEST-001**: System SHALL allow testing without account creation
- **REQ-GUEST-002**: System SHALL provide conversion prompts for account benefits
- **REQ-GUEST-003**: System SHALL limit guest features appropriately
- **REQ-GUEST-004**: System SHALL not persist guest data beyond session

## 3. Non-Functional Requirements

### 3.1 Performance Requirements

- **REQ-PERF-001**: Image analysis SHALL complete within 5 seconds
- **REQ-PERF-002**: Page load time SHALL be under 2 seconds on 3G networks
- **REQ-PERF-003**: Camera capture SHALL have minimal shutter lag
- **REQ-PERF-004**: UI interactions SHALL respond within 100ms
- **REQ-PERF-005**: System SHALL support 1000+ concurrent users

### 3.2 Usability Requirements

- **REQ-UX-001**: System SHALL work on mobile devices 320px width and above
- **REQ-UX-002**: Camera interface SHALL provide clear alignment guidance
- **REQ-UX-003**: Results SHALL be understandable by non-technical users
- **REQ-UX-004**: Error messages SHALL be helpful and actionable
- **REQ-UX-005**: System SHALL work offline for core features

### 3.3 Reliability Requirements

- **REQ-REL-001**: System SHALL have 99.9% uptime during peak usage
- **REQ-REL-002**: Computer vision analysis SHALL have 95%+ accuracy
- **REQ-REL-003**: System SHALL gracefully handle AI service outages
- **REQ-REL-004**: Data SHALL be backed up with 99.99% durability

### 3.4 Security Requirements

- **REQ-SEC-001**: User images SHALL be processed securely and not stored permanently
- **REQ-SEC-002**: Personal data SHALL be encrypted in transit and at rest
- **REQ-SEC-003**: API endpoints SHALL require proper authentication
- **REQ-SEC-004**: System SHALL implement rate limiting on AI endpoints
- **REQ-SEC-005**: User sessions SHALL expire appropriately

### 3.5 Compatibility Requirements

- **REQ-COMPAT-001**: System SHALL work on iOS Safari 14+
- **REQ-COMPAT-002**: System SHALL work on Android Chrome 80+
- **REQ-COMPAT-003**: System SHALL function as PWA with offline capabilities
- **REQ-COMPAT-004**: System SHALL support device camera access via WebRTC
- **REQ-COMPAT-005**: System SHALL degrade gracefully on older browsers

## 4. Technical Constraints

### 4.1 Technology Stack Requirements

- **Platform**: Vercel for hosting and edge functions
- **Framework**: Next.js 15 with App Router
- **Database**: Supabase PostgreSQL with simplified schema
- **Authentication**: Supabase Auth with social login support
- **AI/Vision**: Vercel AI SDK with GPT-4 Vision (beta testing)
- **UI Library**: shadcn/ui with Tailwind CSS

### 4.2 Integration Requirements

- **REQ-INT-001**: System SHALL integrate with GPT-4 Vision API for strip analysis
- **REQ-INT-002**: System SHALL use Vercel Edge Functions for image processing
- **REQ-INT-003**: System SHALL integrate with Supabase for data persistence and authentication
- **REQ-INT-004**: System SHALL implement PWA features for mobile experience
- **REQ-INT-005**: System SHALL support camera access through WebRTC APIs
- **REQ-INT-006**: System SHALL use Supabase real-time features for future partner portal

## 5. Data Requirements

### 5.1 Data Entities

#### 5.1.1 Users

```sql
- id: UUID (primary key)
- email: string (unique)
- name: string
- created_at: timestamp
- preferences: JSON (default unit, test method, etc.)
```

#### 5.1.2 Units

```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- name: string
- type: enum (pool, spa, hot_tub)
- volume: integer (gallons)
- sanitizer_type: enum (chlorine, bromine, salt)
- is_favorite: boolean
- created_at: timestamp
```

#### 5.1.3 Water Tests

```sql
- id: UUID (primary key)
- unit_id: UUID (foreign key)
- test_method: enum (computer_vision, manual)
- ph: decimal(3,1)
- free_chlorine: decimal(4,2)
- total_alkalinity: integer
- cyanuric_acid: integer
- total_hardness: integer
- temperature: integer
- confidence_score: decimal(3,2) (for CV tests)
- image_url: string (temporary storage)
- notes: text
- created_at: timestamp
```

### 5.2 Data Storage Requirements

- **REQ-DATA-001**: Test images SHALL be stored temporarily (24 hours max)
- **REQ-DATA-002**: User data SHALL be stored with geographic compliance
- **REQ-DATA-003**: Historical data SHALL be retained for 2 years minimum
- **REQ-DATA-004**: System SHALL support data export for user portability

## 6. Acceptance Criteria

### 6.1 Computer Vision Accuracy

- Strip detection success rate: >98% under normal conditions
- Chemical reading accuracy: ±0.1 pH, ±0.5 ppm chlorine, ±10 ppm alkalinity
- False positive rate: <2%
- Processing time: <5 seconds average

### 6.2 User Experience Metrics

- Task completion rate: >90% for first-time users
- Time to first successful test: <2 minutes
- User satisfaction score: >4.5/5.0
- Mobile usability score: >90% (Google PageSpeed Insights)

### 6.3 Performance Benchmarks

- Page load speed: <2 seconds (3G network)
- Camera startup time: <1 second
- API response time: <500ms (95th percentile)
- Error rate: <1% of all requests

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Draft for Review
