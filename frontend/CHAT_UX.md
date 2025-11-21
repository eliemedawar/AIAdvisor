# AI Advisor Chat UX Documentation

**Version**: 1.0  
**Last Updated**: November 2024  
**Status**: Production Ready

---

## Overview

The AI Advisor Chat interface is a world-class conversational UI designed for academic coaching and assistance. It combines modern chat patterns with contextual academic information to provide students with an intelligent, helpful experience.

### Design Philosophy

1. **Conversational First** — Clean chat interface that focuses on the conversation
2. **Context-Aware** — Side panel with relevant academic data (GPA, tasks, exams)
3. **Action-Oriented** — Quick action chips for common student workflows
4. **Responsive & Accessible** — Works beautifully on all screen sizes
5. **Professional Polish** — Loading states, error handling, and smooth animations

---

## Architecture

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Persistent Header                                          │
│  - Title: "AI Academic Advisor"                             │
│  - Description: "Ask questions about..."                    │
├──────────────────────────────┬──────────────────────────────┤
│                              │                              │
│  Chat Area (flex-1)          │  Context Sidebar (320px)     │
│  ┌────────────────────────┐  │  ┌────────────────────────┐  │
│  │ Message History        │  │  │ Context Header         │  │
│  │ - Date Separators      │  │  │ "Your academic overview"│  │
│  │ - User Messages        │  │  ├────────────────────────┤  │
│  │ - Assistant Messages   │  │  │ Next Exam Card         │  │
│  │ - Typing Indicator     │  │  │ - Course & title       │  │
│  │ - Error Cards          │  │  │ - Days until           │  │
│  │                        │  │  │ - Progress bar         │  │
│  │ (scrollable)           │  │  ├────────────────────────┤  │
│  └────────────────────────┘  │  │ Weekly Tasks Card      │  │
│                              │  │ - Completed/Total      │  │
├──────────────────────────────┤  │ - Progress bar         │  │
│  Quick Actions (scrollable)  │  ├────────────────────────┤  │
│  [Plan my week] [Review...]  │  │ GPA Trend Card         │  │
├──────────────────────────────┤  │ - Current GPA          │  │
│  Input Area                  │  │ - Trend indicator      │  │
│  [Textarea] [📎] [Send]     │  │ - Previous GPA         │  │
└──────────────────────────────┴──┴────────────────────────┴──┘
```

### Responsive Behavior

#### Desktop (≥1024px)
- Two-column layout: Chat (flex-1) + Sidebar (320px)
- Sidebar toggleable with button (state persisted to localStorage)
- Full feature set visible

#### Tablet (768px - 1023px)
- Sidebar hidden
- Chat takes full width
- Quick actions remain visible
- All chat features functional

#### Mobile (<768px)
- Single column layout
- Sidebar hidden
- Quick actions horizontally scrollable
- Input area stacks vertically on very small screens

---

## Component Hierarchy

### Page Level
```
ChatPage
├── PageShell
│   └── PageSection
│       ├── Header (persistent)
│       ├── Main Content (two-column)
│       │   ├── Chat Column
│       │   │   ├── Message History (scrollable)
│       │   │   ├── QuickActions
│       │   │   └── Input Area
│       │   └── ContextSidebar
│       └── AttachContextModal
```

### Component Details

#### **ChatPage** (`src/pages/chat/ChatPage.tsx`)
Main page component that orchestrates the entire chat experience.

**State Management**:
- `input` — Current textarea value
- `isAttachModalOpen` — Modal visibility state
- Uses `useAdvisorChat()` hook for conversation state

**Key Responsibilities**:
- Layout coordination
- Message submission
- Quick action handling
- Error handling with retry

---

#### **ContextSidebar** (`src/components/chat/ContextSidebar.tsx`)
Right sidebar showing academic context cards.

**Features**:
- Fixed 320px width on desktop
- Toggle button to show/hide (persisted to localStorage)
- Smooth slide animation with Framer Motion
- Hidden on mobile/tablet (uses `useBreakpoint` hook)

**Props**: None (self-contained)

**Usage**:
```tsx
<ContextSidebar />
```

---

#### **Context Cards** (`src/components/chat/ContextCards.tsx`)

Three specialized cards showing real-time academic information:

**NextExamCard**:
- Course name and exam title
- Days until exam
- Visual progress bar
- Formatted date

**WeeklyTasksCard**:
- Completed vs. total tasks
- Percentage completion
- Progress bar
- Remaining count

**GpaTrendCard**:
- Current GPA (large, prominent)
- Trend indicator (↑↓→)
- Difference from previous GPA
- Previous GPA for reference

**Data Source**: Mock data currently; designed to receive props for real data integration.

---

#### **QuickActions** (`src/components/chat/QuickActions.tsx`)
Horizontal row of action chips for common student queries.

**Features**:
- Horizontally scrollable on mobile
- Predefined prompts for common tasks
- Populates input textarea on click
- Disabled state during loading/sending

**Props**:
```tsx
interface QuickActionsProps {
  onSelectAction: (prompt: string) => void;
  disabled?: boolean;
}
```

**Predefined Actions**:
1. "Plan my week" — Weekly planning assistance
2. "Review my schedule" — Daily focus recommendations
3. "Help me study for exam" — Exam preparation guidance
4. "Explain this concept" — Concept clarification

---

#### **ChatInput** (`src/components/core/ChatInput.tsx`)
Auto-resizing textarea with keyboard shortcuts.

**Features**:
- Auto-grows from 1 line to max 6 lines
- Enter to submit, Shift+Enter for newline
- Smooth height transitions
- Matches design system styling

**Props**:
```tsx
interface ChatInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxRows?: number;  // Default: 6
  minRows?: number;  // Default: 1
}
```

---

#### **AttachContextModal** (`src/components/chat/AttachContextModal.tsx`)
Modal for selecting academic context to attach to messages.

**Features**:
- Three tabs: Courses, Assignments, Tasks
- Search/filter functionality
- Multi-select with checkboxes
- Selected count display
- Badge indicators on tabs

**Props**:
```tsx
interface AttachContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttach: (context: SelectedContext) => void;
}

interface SelectedContext {
  courses: number[];
  assignments: number[];
  tasks: number[];
}
```

**Future Enhancement**: Selected context will be sent with message to provide AI with relevant academic information.

---

#### **DateSeparator** (`src/components/chat/DateSeparator.tsx`)
Shows date labels between message groups.

**Features**:
- Formats dates intelligently:
  - "Today"
  - "Yesterday"
  - "Monday, Nov 18" (for older dates)
- Center-aligned with decorative lines
- Minimal, unobtrusive styling

**Helper Function**:
```tsx
groupMessagesByDate(messages: Message[]): { date: string; messages: Message[] }[]
```
Groups messages by calendar day for efficient rendering.

---

## Interaction Patterns

### Message Flow

1. **User Types Message**
   - Input grows automatically (up to 6 lines)
   - Character limit: None (server-side validation)
   - Shift+Enter for multiline, Enter to send

2. **Message Submission**
   - Input clears immediately
   - Message appears in chat instantly (optimistic UI)
   - Typing indicator shows for assistant response

3. **Assistant Response**
   - Typing indicator with animated dots
   - Message fades in smoothly
   - Auto-scroll to bottom

4. **Error Handling**
   - Error card appears below last message
   - Shows error message
   - "Retry" button resends last user message
   - "Dismiss" button clears error

### Quick Actions

**Interaction**:
1. User clicks quick action chip
2. Chip content populates input textarea
3. User can edit prompt before sending
4. User presses Send or Enter

**Design Rationale**: Gives users a starting point but allows customization, more flexible than auto-sending.

### Context Attachment

**Flow**:
1. User clicks paperclip icon
2. Modal opens with tabs (Courses, Assignments, Tasks)
3. User searches/browses items
4. User checks desired items
5. Selected count updates in real-time
6. User clicks "Attach Context"
7. Modal closes, context stored for next message

**Future State**: Attached context sent with message as structured metadata for AI to reference.

### Sidebar Toggle

**Desktop Only**:
1. Toggle button fixed to right edge
2. Click to hide/show sidebar
3. Smooth slide animation
4. State persisted to localStorage
5. Icon changes: ChevronRight (visible) / ChevronLeft (hidden)

---

## States & Feedback

### Loading States

**Initial Load**:
- Skeleton chat messages (3 bubbles)
- Input disabled with placeholder "Preparing your conversation…"

**Sending Message**:
- Input clears immediately
- Typing indicator appears
- Send button disabled
- Quick actions disabled

### Empty State

**First Visit** (no messages):
- Centered welcome card
- Bot icon with gradient background
- Welcome heading
- Descriptive text
- Quick action suggestions (same as chips)

### Error States

**Failed Message**:
- Error card below chat history
- Alert icon + error message
- Two action buttons: "Retry" and "Dismiss"
- Error persists until dismissed or retry succeeds

**Network Error**:
- Error message: "Failed to send message"
- Retry button attempts to resend
- Previous messages remain visible

### Success States

**Message Sent**:
- User message appears immediately
- Smooth fade-in animation
- Auto-scroll to bottom

**Message Received**:
- Assistant message appears after typing indicator
- Smooth transition
- Auto-scroll to bottom

---

## Styling & Design Tokens

### Colors

**Chat Bubbles**:
- User: `bg-gradient-to-br from-primary-600 to-primary-500` (Sapphire gradient)
- Assistant: `bg-slate-800/80 border border-slate-700/60` (Subtle gray)

**Avatars**:
- User: Gradient background matching bubble
- Assistant: Gray background with border

**Context Cards**:
- Background: `bg-slate-900/60` (elevated card variant)
- Icons: Brand colors (primary-400, secondary-400, accent-500)

**Quick Actions**:
- Default: `bg-slate-800/60 border border-slate-700/60`
- Hover: `bg-slate-700/80 border-slate-600/80`

### Typography

**Message Text**:
- Size: `text-sm` (14px)
- Line height: `leading-relaxed` (1.625)
- Color: `text-slate-50` (user), `text-slate-100` (assistant)

**Date Separators**:
- Size: `text-xs` (12px)
- Weight: `font-medium`
- Transform: `uppercase`
- Tracking: `tracking-wide`
- Color: `text-slate-500`

**Context Card Headers**:
- Size: `text-sm` (14px)
- Weight: `font-semibold`
- Color: `text-slate-300`

### Spacing

**Message Gaps**:
- Between messages: `mb-4` (16px)
- Between message groups: Date separator provides visual break

**Card Padding**:
- Message bubbles: `px-4 py-3` (16px × 12px)
- Context cards: `p-6` (24px)
- Input area: `p-4` (16px)

**Sidebar**:
- Width: `w-80` (320px)
- Gap between cards: `space-y-4` (16px)
- Padding: `p-4` (16px)

### Animations

**Message Entrance**:
```tsx
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.2 }}
```

**Sidebar Toggle**:
```tsx
initial={{ x: 320, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
exit={{ x: 320, opacity: 0 }}
transition={{ type: "spring", stiffness: 300, damping: 30 }}
```

**Typing Indicator**:
- Three dots with staggered pulse animation
- Animation delay: 0s, 0.2s, 0.4s

---

## Accessibility

### Keyboard Navigation

**Input Area**:
- Tab to input → Tab to attach button → Tab to send button
- Enter to submit (without modifier)
- Shift+Enter for newline in textarea

**Modal**:
- Tab through search input and checkboxes
- Escape to close
- Focus trap within modal

**Sidebar Toggle**:
- Focusable with keyboard
- Enter/Space to toggle
- Visible focus ring

### Screen Readers

**Labels**:
- All buttons have aria-labels
- Modal has proper aria-role
- Message list has semantic structure

**Live Regions**:
- New messages announced
- Error messages announced
- Typing indicator status

### Color Contrast

All text meets **WCAG AA** standards:
- Message text: >7:1 contrast ratio
- Date separators: >4.5:1 contrast ratio
- Error text: >4.5:1 contrast ratio

---

## Performance Considerations

### Optimizations

**Message Rendering**:
- Grouped by date to reduce re-renders
- AnimatePresence for efficient exit animations
- Virtual scrolling not needed (academic conversations typically <100 messages)

**Auto-scroll**:
- Debounced with useEffect dependency
- Only triggers on message changes
- Smooth scroll behavior

**Sidebar State**:
- localStorage persistence prevents flicker
- Conditional rendering on breakpoint
- Memoized breakpoint detection

**Modal**:
- Lazy-loaded (only rendered when open)
- Search filter optimized with useMemo (future enhancement)
- Checkbox state managed efficiently

---

## Future Enhancements

### Phase 2 Features

1. **Real Context Integration**
   - Wire up context cards to dashboard API
   - Send attached context with messages
   - AI references specific courses/assignments in responses

2. **Message Actions**
   - Copy message text
   - Regenerate assistant response
   - Message editing (user messages)

3. **Rich Content**
   - Markdown rendering in assistant messages
   - Code syntax highlighting
   - Inline images/attachments

4. **Conversation Management**
   - Multiple conversation threads
   - Conversation history sidebar
   - Search within conversations
   - Export conversation

5. **Advanced Features**
   - Voice input
   - Message reactions
   - Suggested follow-up questions
   - Real-time collaboration (tutor joins chat)

### Technical Debt

- Add unit tests for chat components
- Add E2E tests for message flow
- Optimize bundle size (lazy load modal)
- Add telemetry/analytics events

---

## Testing Checklist

### Functional Testing

- [ ] Send message with Enter key
- [ ] Send message with Send button
- [ ] Shift+Enter creates newline
- [ ] Textarea auto-resizes (1-6 lines)
- [ ] Quick action populates input
- [ ] Attach context modal opens/closes
- [ ] Context selection works across tabs
- [ ] Retry button resends last message
- [ ] Dismiss button clears error
- [ ] Sidebar toggle persists to localStorage
- [ ] Date separators show correct labels

### Responsive Testing

- [ ] Desktop: Two-column layout works
- [ ] Desktop: Sidebar toggle works
- [ ] Tablet: Sidebar hidden
- [ ] Mobile: Single column layout
- [ ] Mobile: Quick actions scroll horizontally
- [ ] Mobile: Input area stacks properly

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader announces messages
- [ ] Focus indicators visible
- [ ] Modal traps focus
- [ ] Color contrast meets WCAG AA
- [ ] All buttons have labels

### Browser Testing

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Troubleshooting

### Common Issues

**Sidebar not showing on desktop**:
- Check localStorage for `ai-advisor-sidebar-visible` key
- Clear and reload
- Check `useBreakpoint` hook detects correct breakpoint

**Messages not scrolling**:
- Verify scrollRef is attached to container
- Check overflow-y-auto class present
- Ensure min-h-0 on flex parent

**Textarea not auto-resizing**:
- Check ChatInput component has value prop
- Verify useEffect dependency array includes value
- Console log scrollHeight to debug

**Quick actions disabled**:
- Check loading/sending state in useAdvisorChat
- Verify disabled prop passed correctly
- Check button styles for disabled state

---

## Code Examples

### Using ChatInput

```tsx
import { ChatInput } from "@/components/core/ChatInput";

function MyComponent() {
  const [input, setInput] = useState("");
  
  const handleSubmit = () => {
    console.log("Submitted:", input);
    setInput("");
  };
  
  return (
    <ChatInput
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onSubmit={handleSubmit}
      placeholder="Type a message..."
      maxRows={6}
    />
  );
}
```

### Integrating Context Cards with Real Data

```tsx
// Future implementation
import { NextExamCard } from "@/components/chat/ContextCards";
import { useDashboard } from "@/hooks/useDashboard";

function ContextSidebar() {
  const { upcomingDeadlines } = useDashboard();
  const nextExam = upcomingDeadlines.find(d => d.type === "exam");
  
  return (
    <aside>
      {nextExam && <NextExamCard exam={nextExam} />}
    </aside>
  );
}
```

### Handling Attached Context

```tsx
const handleAttachContext = (context: SelectedContext) => {
  // Store context for next message
  setAttachedContext(context);
  
  // When sending message, include context
  await sendMessage(input, {
    courses: context.courses,
    assignments: context.assignments,
    tasks: context.tasks
  });
};
```

---

## Maintenance

**Component Ownership**: Frontend Team  
**Primary Contact**: See team documentation  
**Last Review**: November 2024  
**Next Review**: January 2025

### Related Documentation

- [Design System](./DESIGN_SYSTEM.md) — Brand colors, typography, spacing
- [Components](./COMPONENTS.md) — Core component library
- [Dashboard UX](./DASHBOARD.md) — Dashboard patterns and data

---

**Questions or Issues?** Refer to component implementations in `src/components/chat/` or reach out to the frontend team.

