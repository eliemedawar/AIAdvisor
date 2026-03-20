# Automated Demo Executor - Step-by-Step Browser Actions

This document contains the exact browser automation sequence that Cursor can execute to perform the live demo.

---

## EXECUTION SEQUENCE

### PHASE 1: INITIALIZATION & LOGIN

#### Step 1.1: Navigate to Application
```
ACTION: mcp_cursor-ide-browser_browser_navigate
URL: http://localhost:5173
WAIT: 2 seconds
```

#### Step 1.2: Take Initial Screenshot
```
ACTION: mcp_cursor-ide-browser_browser_take_screenshot
FILENAME: 01-landing-page.png
```

#### Step 1.3: Capture Page Snapshot (to identify elements)
```
ACTION: mcp_cursor-ide-browser_browser_snapshot
```

#### Step 1.4: Click Sign In Button
```
ACTION: mcp_cursor-ide-browser_browser_click
ELEMENT: Sign In button or link
REF: [Will be determined from snapshot]
NARRATION: "Welcome to the AI Academic Advisor. Let me sign in to show you the platform."
```

#### Step 1.5: Enter Email
```
ACTION: mcp_cursor-ide-browser_browser_type
ELEMENT: Email input field
REF: [Will be determined from snapshot]
TEXT: demo@student.edu
```

#### Step 1.6: Enter Password
```
ACTION: mcp_cursor-ide-browser_browser_type
ELEMENT: Password input field
REF: [Will be determined from snapshot]
TEXT: demo123
```

#### Step 1.7: Submit Login
```
ACTION: mcp_cursor-ide-browser_browser_click
ELEMENT: Sign In submit button
REF: [Will be determined from snapshot]
WAIT: 3 seconds for authentication
```

#### Step 1.8: Take Screenshot After Login
```
ACTION: mcp_cursor-ide-browser_browser_take_screenshot
FILENAME: 02-after-login-dashboard.png
```

---

### PHASE 2: DASHBOARD EXPLORATION

#### Step 2.1: Wait for Dashboard Load
```
ACTION: mcp_cursor-ide-browser_browser_wait_for
TIME: 2 seconds
NARRATION: "Here's the personalized dashboard showing a complete academic overview."
```

#### Step 2.2: Capture Dashboard Snapshot
```
ACTION: mcp_cursor-ide-browser_browser_snapshot
```

#### Step 2.3: Take Full Dashboard Screenshot
```
ACTION: mcp_cursor-ide-browser_browser_take_screenshot
FILENAME: 03-dashboard-overview.png
FULL_PAGE: true
```

#### Step 2.4: Hover Over GPA Stat Card
```
ACTION: mcp_cursor-ide-browser_browser_hover
ELEMENT: Current GPA stat card
REF: [Will be determined from snapshot]
NARRATION: "The dashboard displays current GPA with trend indicators."
WAIT: 1.5 seconds
```

#### Step 2.5: Scroll to View Charts
```
ACTION: mcp_cursor-ide-browser_browser_press_key
KEY: PageDown
WAIT: 1 second
NARRATION: "This chart tracks GPA progression over time, helping students visualize their performance."
```

#### Step 2.6: Take Chart Screenshot
```
ACTION: mcp_cursor-ide-browser_browser_take_screenshot
FILENAME: 04-dashboard-charts.png
```

#### Step 2.7: Scroll to View Tasks Section
```
ACTION: mcp_cursor-ide-browser_browser_press_key
KEY: PageDown
WAIT: 1 second
NARRATION: "Students see their immediate priorities and courses needing attention."
```

#### Step 2.8: Take Tasks Screenshot
```
ACTION: mcp_cursor-ide-browser_browser_take_screenshot
FILENAME: 05-dashboard-tasks.png
```

#### Step 2.9: Scroll Back to Top
```
ACTION: mcp_cursor-ide-browser_browser_press_key
KEY: Home
WAIT: 1 second
```

---

### PHASE 3: AI CHATBOT DEMONSTRATION

#### Step 3.1: Navigate to Chat Page
```
ACTION: mcp_cursor-ide-browser_browser_snapshot
```

#### Step 3.2: Click AI Advisor Link
```
ACTION: mcp_cursor-ide-browser_browser_click
ELEMENT: AI Advisor navigation link (sidebar or menu)
REF: [Will be determined from snapshot]
NARRATION: "Now let's explore the AI Academic Advisor - the intelligent core of the platform."
WAIT: 2 seconds
```

#### Step 3.3: Take Chat Page Screenshot
```
ACTION: mcp_cursor-ide-browser_browser_take_screenshot
FILENAME: 06-chat-empty-state.png
```

#### Step 3.4: Capture Chat Page Snapshot
```
ACTION: mcp_cursor-ide-browser_browser_snapshot
```

#### Step 3.5: Click Quick Starter Prompt
```
ACTION: mcp_cursor-ide-browser_browser_click
ELEMENT: Quick starter button with text "Review my week and tell me what to focus on."
REF: [Will be determined from snapshot]
NARRATION: "Students can ask the AI to analyze their workload and provide personalized recommendations."
WAIT: 3 seconds for AI response
```

#### Step 3.6: Wait for AI Response
```
ACTION: mcp_cursor-ide-browser_browser_wait_for
TIME: 3 seconds
```

#### Step 3.7: Take Chat Conversation Screenshot
```
ACTION: mcp_cursor-ide-browser_browser_take_screenshot
FILENAME: 07-chat-with-response.png
FULL_PAGE: true
```

#### Step 3.8: Scroll to View Full Response
```
ACTION: mcp_cursor-ide-browser_browser_press_key
KEY: PageDown
WAIT: 1.5 seconds
NARRATION: "The AI has real-time access to academic data, ensuring contextual and relevant advice."
```

#### Step 3.9: Take Context Sidebar Screenshot (Desktop Only)
```
ACTION: mcp_cursor-ide-browser_browser_take_screenshot
FILENAME: 08-chat-with-context.png
```

---

### PHASE 4: CALENDAR & SCHEDULING

#### Step 4.1: Navigate to Calendar
```
ACTION: mcp_cursor-ide-browser_browser_snapshot
```

#### Step 4.2: Click Calendar Link
```
ACTION: mcp_cursor-ide-browser_browser_click
ELEMENT: Calendar navigation link
REF: [Will be determined from snapshot]
NARRATION: "The calendar gives students a complete view of their academic schedule."
WAIT: 2 seconds
```

#### Step 4.3: Take Calendar Screenshot
```
ACTION: mcp_cursor-ide-browser_browser_take_screenshot
FILENAME: 09-calendar-month-view.png
FULL_PAGE: true
```

#### Step 4.4: Capture Calendar Snapshot
```
ACTION: mcp_cursor-ide-browser_browser_snapshot
```

#### Step 4.5: Click on a Day with Events
```
ACTION: mcp_cursor-ide-browser_browser_click
ELEMENT: Calendar day cell with event indicators
REF: [Will be determined from snapshot]
NARRATION: "Clicking any day shows assignments, exams, and study blocks."
WAIT: 1.5 seconds
```

#### Step 4.6: Take Day Details Screenshot
```
ACTION: mcp_cursor-ide-browser_browser_take_screenshot
FILENAME: 10-calendar-day-details.png
```

#### Step 4.7: Close Day Details Panel
```
ACTION: mcp_cursor-ide-browser_browser_press_key
KEY: Escape
WAIT: 0.5 seconds
```

#### Step 4.8: Capture Snapshot Again
```
ACTION: mcp_cursor-ide-browser_browser_snapshot
```

#### Step 4.9: Switch to Week View
```
ACTION: mcp_cursor-ide-browser_browser_click
ELEMENT: Week view button
REF: [Will be determined from snapshot]
NARRATION: "The calendar supports multiple views - month, week, and agenda."
WAIT: 1 second
```

#### Step 4.10: Take Week View Screenshot
```
ACTION: mcp_cursor-ide-browser_browser_take_screenshot
FILENAME: 11-calendar-week-view.png
```

---

### PHASE 5: PROFILE MANAGEMENT

#### Step 5.1: Navigate to Profile
```
ACTION: mcp_cursor-ide-browser_browser_snapshot
```

#### Step 5.2: Click Profile Link
```
ACTION: mcp_cursor-ide-browser_browser_click
ELEMENT: Profile navigation link
REF: [Will be determined from snapshot]
NARRATION: "In the profile section, students manage their academic information."
WAIT: 2 seconds
```

#### Step 5.3: Take Profile Screenshot
```
ACTION: mcp_cursor-ide-browser_browser_take_screenshot
FILENAME: 12-profile-page.png
FULL_PAGE: true
```

#### Step 5.4: Capture Profile Snapshot
```
ACTION: mcp_cursor-ide-browser_browser_snapshot
```

#### Step 5.5: Scroll to View Stats
```
ACTION: mcp_cursor-ide-browser_browser_press_key
KEY: PageDown
WAIT: 1 second
NARRATION: "Students can set target GPA goals and manage their major and year."
```

#### Step 5.6: Take Academic Info Screenshot
```
ACTION: mcp_cursor-ide-browser_browser_take_screenshot
FILENAME: 13-profile-academic-info.png
```

---

### PHASE 6: CLOSING - RETURN TO DASHBOARD

#### Step 6.1: Navigate Back to Dashboard
```
ACTION: mcp_cursor-ide-browser_browser_snapshot
```

#### Step 6.2: Click Dashboard Link
```
ACTION: mcp_cursor-ide-browser_browser_click
ELEMENT: Dashboard navigation link
REF: [Will be determined from snapshot]
NARRATION: "The AI Academic Advisor brings together analytics, AI, and design to help students succeed."
WAIT: 2 seconds
```

#### Step 6.3: Take Final Dashboard Screenshot
```
ACTION: mcp_cursor-ide-browser_browser_take_screenshot
FILENAME: 14-final-dashboard.png
FULL_PAGE: true
```

#### Step 6.4: Slow Scroll Through Dashboard
```
ACTION: mcp_cursor-ide-browser_browser_press_key
KEY: PageDown
WAIT: 1 second
ACTION: mcp_cursor-ide-browser_browser_press_key
KEY: PageDown
WAIT: 1 second
NARRATION: "From GPA tracking to AI-powered advice - everything a student needs in one platform."
```

#### Step 6.5: Take Final Screenshot
```
ACTION: mcp_cursor-ide-browser_browser_take_screenshot
FILENAME: 15-demo-complete.png
```

#### Step 6.6: Console Check (Optional Debug)
```
ACTION: mcp_cursor-ide-browser_browser_console_messages
```

---

## EXECUTION NOTES

### Timing Guidelines
- Each snapshot/action: ~0.5-1 second
- Page transitions: 1.5-2 seconds
- AI responses: 2-3 seconds
- Total estimated time: 2:30 - 3:00 minutes

### Element Detection Strategy
Since element references need to be determined dynamically:
1. Take snapshot first
2. Identify interactive elements by role/text/aria-label
3. Use the `ref` from snapshot to target elements
4. Fallback to text-based selection if ref not available

### Error Handling
- If element not found, take screenshot for debugging
- If page doesn't load, wait additional 2 seconds
- If AI response times out, continue to next step
- Log all errors to console

### Screenshot Storage
All screenshots will be saved to the project root or a `demo-screenshots/` folder for later review.

---

## BROWSER SETUP

### Recommended Settings
```
Browser: Chrome
Resolution: 1920x1080 or 1280x720
Zoom Level: 100%
Extensions: Disabled
Cache: Cleared
```

### Pre-requisites Check
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] Test user exists: demo@student.edu
- [ ] Sample data loaded in database
- [ ] Network connectivity stable

---

## EXECUTION COMMAND SUMMARY

To execute this demo, Cursor will:
1. Navigate to the app URL
2. Take snapshots to identify UI elements
3. Interact with elements (click, type, hover)
4. Capture screenshots at key moments
5. Wait for animations and page transitions
6. Follow the narration script timing

**TOTAL STEPS:** ~50 browser actions  
**TOTAL DURATION:** ~2:30 - 3:00 minutes  
**OUTPUT:** 15 screenshots documenting the full demo journey




