# MentorLink — University Senior-Junior Mentorship Platform

MentorLink is a production-ready, full-stack mentorship SaaS platform engineered specifically for university senior-junior peer guidance, career preparation, mock technical interviews, and real-time collaboration.

---

## 🎨 1. Design Reference & UI Consistency
Designed in adherence with the MentorLink Design System:
- **Navy Navigation Canvas (`#0B1528`):** Deep navy left sidebar with subtle indigo accents, active badges, persona switcher, and student profile widget.
- **Light Airy Workspace:** Soft `#F8FAFC` background with crisp white cards (`#FFFFFF`), rounded borders (`rounded-2xl`), and subtle elevation shadows.
- **Primary Color Palette:** Vibrant indigo (`#6366F1`) & royal purple (`#7C3AED`) accents, emerald green (`#10B981`) for verified status & connected sessions, and warm amber (`#F59E0B`) for milestone badges.
- **Zero Static Placeholders:** 100% of buttons, forms, filters, modals, calendars, checkboxes, and call controls are fully interactive end-to-end.

---

## 🚀 2. Tech Stack & Architecture
- **Frontend Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + PostCSS with glassmorphism effects and custom animations
- **Iconography:** Lucide React
- **Celebration Effects:** Canvas-Confetti on goal milestone 100% completions
- **Audio Synthesizer:** Pure programmatic Web Audio API synthesizer for ringtones, join chimes, and message notifications (zero external MP3 dependencies)
- **Real-Time WebRTC Calling Engine:**
  - Browser peer-to-peer MediaStream pipeline (`getUserMedia` + `getDisplayMedia`)
  - Google Public STUN servers (`stun:stun.l.google.com:19302`)
  - Cross-tab / cross-window signaling via `BroadcastChannel` with fallback to `localStorage` StorageEvents
  - Incoming call audio ringtone with Accept / Decline prompts
  - Working in-call controls: Mute Mic, Toggle Camera, Screen Share, Live Call Timer, End Call

---

## 📁 3. Codebase Structure

```
seniorJuniorMentorshipFinal/
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Global Root Layout & AppShell Provider
│   │   ├── globals.css                    # Tailwind CSS v4 styling & animations
│   │   ├── page.tsx                       # Dashboard (Stats, Upcoming Sessions, Goals, Recommendations)
│   │   ├── find-mentors/
│   │   │   └── page.tsx                   # Live Search, Multi-Filter, Profile Preview & Mentorship Request Modal
│   │   ├── my-connections/
│   │   │   └── page.tsx                   # Active Connections, Senior Accept/Decline Inbox, Chat/Call triggers
│   │   ├── sessions/
│   │   │   └── page.tsx                   # Interactive Monthly Calendar, Book Session, Reschedule & Join Call
│   │   ├── messages/
│   │   │   └── page.tsx                   # Real-Time Chat + Integrated Audio & Video Call header + Info Sidebar
│   │   ├── goals/
│   │   │   └── page.tsx                   # Milestones & Goal Roadmaps with dynamic progress bar and confetti
│   │   ├── resources/
│   │   │   └── page.tsx                   # Study Library (Upload, Filter, Bookmark, and Real Download)
│   │   └── onboarding/
│   │       └── page.tsx                   # Stepper (Role Selection, Department/Year, Skills & Bio)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx               # Client Shell with Providers & Modals
│   │   │   ├── Sidebar.tsx                # Figma Dark Navy Left Sidebar
│   │   │   ├── TopHeader.tsx              # Universal Search, Notification Dropdown, Persona Switcher
│   │   │   └── QuickActionModal.tsx       # Fast-trigger modal accessible anywhere
│   │   ├── webrtc/
│   │   │   ├── CallRoomModal.tsx          # Fullscreen / Floating Video & Audio WebRTC Room
│   │   │   └── IncomingCallAlert.tsx      # Ringtone and popup alert with Accept / Decline
│   │   ├── dashboard/
│   │   │   ├── StatsOverview.tsx          # Key metrics cards
│   │   │   ├── UpcomingSessionsWidget.tsx # Countdown & 1-click Join Call
│   │   │   └── ActiveGoalsWidget.tsx      # Dynamic milestone checklist
│   │   ├── mentors/
│   │   │   ├── MentorCard.tsx             # Rating, skills, preview & request triggers
│   │   │   ├── MentorProfileModal.tsx     # Full background, experience, and contact links
│   │   │   └── RequestMentorshipModal.tsx # Form with cadence, topics, and custom pitch
│   │   ├── chat/
│   │   │   ├── ConversationList.tsx       # Search, unread badges, filter tabs
│   │   │   ├── ChatThread.tsx             # Real-time messages, typing indicators, attachments, WebRTC buttons
│   │   │   └── UserDetailsSidebar.tsx     # Collapsible right drawer with shared goals and files
│   │   ├── calendar/
│   │   │   ├── BookSessionModal.tsx       # Date, time slots, duration, and session format
│   │   │   └── RescheduleModal.tsx        # Reschedule time and date
│   │   ├── goals/
│   │   │   └── CreateGoalModal.tsx        # Add goals with dynamic milestones
│   │   └── resources/
│   │       └── UploadResourceModal.tsx    # Upload study materials and roadmaps
│   ├── context/
│   │   ├── AuthContext.tsx                # Active user, Role switcher, Persona selector
│   │   ├── MentorshipContext.tsx          # Requests, Sessions, Goals, Messages, Resources store
│   │   ├── WebRTCContext.tsx              # PeerConnection lifecycle, local/remote streams, signaling
│   │   └── ToastContext.tsx               # Beautiful notification toasts
│   ├── lib/
│   │   ├── mockData.ts                    # Verified university mentors, sessions, goals, resources
│   │   ├── sound.ts                       # Web Audio API ringtone and notification chime synthesizer
│   │   ├── storage.ts                     # LocalStorage / cloud storage bridge
│   │   └── utils.ts                       # Date formatters, classNames, file downloader
│   └── types/
│       └── index.ts                       # Strongly-typed TypeScript interfaces
├── .env.example                           # Environment configuration template
└── package.json
```

---

## ⚡ 4. Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v22)
- npm or pnpm

### Installation
```bash
npm install
```

### Run Locally in Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm run start
```

---

## 🧪 5. Testing the End-to-End Features

1. **One-Click Persona Switcher:**
   - In the top header or sidebar, click **"Switch Demo User"** or **"Switch to Sarah (Senior)"** / **"Switch to Alex (Junior)"**.
   - As **Alex Chen (Junior Mentee)**: Browse mentors, send a mentorship request, book sessions, and tick milestone checklists.
   - As **Sarah Jenkins (Senior Mentor)**: Navigate to **My Connections** to see the incoming mentorship requests with working **Accept** and **Decline** buttons!
2. **WebRTC Video & Audio Calling:**
   - Navigate to **Messages & Calls** or click **"Join Call"** on any upcoming session.
   - Click the **Audio Call** or **Video Call** buttons in the chat header.
   - If testing across 2 tabs (one as Alex and one as Sarah), the other tab will ring with the harmonic ringtone and show the **Incoming Call Alert** with working **Accept** and **Decline** buttons.
   - During the call, test:
     - **Mute / Unmute Microphone**
     - **Toggle Camera On / Off**
     - **Screen Share** (swaps video stream to chosen browser tab/window)
     - **Call Duration Timer**
     - **End Call** (cleanly releases hardware and tracks)
3. **Goals & Milestones:**
   - Go to **Goals & Milestones** (`/goals`). Click checkboxes to complete tasks — notice the progress bar automatically recalculates in real-time, and finishing 100% unleashes celebratory confetti!
4. **Resources Library:**
   - Go to **Resources Library** (`/resources`). Search or filter by categories.
   - Click **Download** on any study guide or FAANG resume template — it generates and downloads the file instantly to your device.
   - Click the **Bookmark** star to persist favorites.
