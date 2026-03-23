# Neural Canvas - Complete Implementation Guide

## Overview

This guide provides a detailed, step-by-step blueprint for redesigning the AIAdvisor frontend with the **Neural Canvas** aesthetic: a futuristic, editorial dark theme with electric indigo (#6C63FF) and neon teal (#00D2C8) accents, glassmorphism, and innovative navigation patterns.

**Design Philosophy**: Think Perplexity AI, Arc Browser, Raycast, and Linear — but more expressive and bold. This is NOT a university admin panel; it's a next-gen AI product interface.

---

## Part 1: Design System Foundation

### Color Palette

```
VOID (Base Background):
  #080B14 - void-950 (main background)
  #0D1117 - void-900 (surface)
  #131820 - void-850 (slightly lighter)
  #1A1F2E - void-800 (card background)

ELECTRIC INDIGO (Primary):
  #6C63FF - indigo-neon-600 (primary action, highlights)
  #7B72FF - indigo-neon-500 (hover state)
  #8A81FF - indigo-neon-400 (lighter variant)
  #9B92FF - indigo-neon-300 (lightest variant)

NEON TEAL (Secondary / Data):
  #00D2C8 - teal-neon-600 (data visualization, secondary action)
  #1ADDD4 - teal-neon-500 (hover state)
  #33E8E0 - teal-neon-400 (lighter variant)
  #4DF3EC - teal-neon-300 (lightest variant)

SEMANTIC:
  #10B981 - success
  #F59E0B - warning
  #EF4444 - danger
  #3B82F6 - info
```

### Typography System

**Fonts**:
- **Display/Headings**: Syne (or Space Grotesk as fallback) — bold, expressive, editorial
- **Body/UI**: Inter — clean, readable, professional

**Scale**:
```
h1: 3rem (48px) - bold, editorial
h2: 2.25rem (36px) - section headers
h3: 1.875rem (30px) - subsection headers
h4: 1.5rem (24px) - card titles
h5: 1.25rem (20px) - labels
h6: 1rem (16px) - small labels

body: 1rem (16px)
small: 0.875rem (14px)
xs: 0.75rem (12px)
```

### Glassmorphism System

All glass elements use:
- `backdrop-filter: blur(20px)` (or blur(10px) for subtle variants)
- `background: rgba(13, 17, 23, 0.4)` or `rgba(13, 17, 23, 0.6)` for stronger
- `border: 1px solid rgba(108, 99, 255, 0.1)` (indigo glow border)

**Three levels**:
1. `.glass` - subtle (0.4 opacity, 20px blur)
2. `.glass-strong` - medium (0.6 opacity, 20px blur)
3. `.glass-sm` - minimal (0.3 opacity, 10px blur)

### Spacing System

```
1px = 0.0625rem
2px = 0.125rem
4px = 0.25rem
8px = 0.5rem
12px = 0.75rem
16px = 1rem
24px = 1.5rem
32px = 2rem
48px = 3rem
64px = 4rem
```

Use 8px grid for consistency.

### Border Radius

```
sm: 0.25rem (4px)
md: 0.75rem (12px)
lg: 1rem (16px)
xl: 1.25rem (20px)
2xl: 1.5rem (24px)
full: 9999px (pills)
```

### Shadows & Glows

```
Elevation Shadows:
  sm: 0 1px 2px rgba(0,0,0,0.1)
  md: 0 4px 6px rgba(0,0,0,0.15)
  lg: 0 10px 15px rgba(0,0,0,0.2)
  xl: 0 20px 25px rgba(0,0,0,0.3)

Glow Effects:
  glow-indigo: 0 0 20px rgba(108, 99, 255, 0.3)
  glow-indigo-lg: 0 0 40px rgba(108, 99, 255, 0.4)
  glow-teal: 0 0 20px rgba(0, 210, 200, 0.3)
  glow-teal-lg: 0 0 40px rgba(0, 210, 200, 0.4)
```

### Animations

All animations max 300ms (snappy, not slow).

```
Entrance: fade-in + slide-up (200-300ms)
Hover: scale(1.02) + glow increase (200ms)
Loading: pulse + subtle shimmer (1.4s loop)
Transitions: cubic-bezier(0.4, 0, 0.2, 1) - smooth easing
```

---

## Part 2: Navigation System

### Desktop Navigation (Left Icon Rail)

**Structure**:
- 64px wide icon-only vertical rail on the left
- Expands to 220px with labels on hover
- Glowing active indicator (indigo glow)
- Fixed position, full viewport height
- Smooth transitions (200ms)

**Implementation**:
```tsx
// src/components/navigation/DesktopNav.tsx
export const DesktopNav = () => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <nav className="fixed left-0 top-0 h-screen w-16 hover:w-56 transition-all duration-200 bg-void-900 border-r border-indigo-neon-600/10 flex flex-col items-center py-8 gap-4">
      {/* Logo or icon at top */}
      <div className="w-12 h-12 rounded-lg bg-glass flex items-center justify-center glow-indigo">
        <span className="text-indigo-neon-600 font-bold">AI</span>
      </div>
      
      {/* Nav items */}
      <NavItem icon={<Home />} label="Dashboard" href="/dashboard" />
      <NavItem icon={<MessageSquare />} label="Chat" href="/chat" />
      <NavItem icon={<Calendar />} label="Calendar" href="/calendar" />
      <NavItem icon={<CheckSquare />} label="Planner" href="/planner" />
      <NavItem icon={<User />} label="Profile" href="/profile" />
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Logout at bottom */}
      <NavItem icon={<LogOut />} label="Logout" href="/logout" />
    </nav>
  );
};

const NavItem = ({ icon, label, href }) => {
  const isActive = useLocation().pathname === href;
  
  return (
    <Link to={href} className="group relative w-12 flex items-center justify-center">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
        isActive 
          ? 'bg-indigo-neon-600 text-void-950 glow-indigo' 
          : 'bg-glass text-gray-400 group-hover:text-indigo-neon-600'
      }`}>
        {icon}
      </div>
      
      {/* Label appears on hover */}
      <span className="absolute left-16 px-3 py-2 bg-glass-strong rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {label}
      </span>
    </Link>
  );
};
```

### Mobile Navigation (Bottom Tab Bar)

**Structure**:
- Floating pill-shaped tab bar at bottom
- 5 icons centered
- Glassmorphic background
- Fixed position, safe-area-inset-bottom
- Active indicator (underline or glow)

**Implementation**:
```tsx
// src/components/navigation/MobileNav.tsx
export const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 sm:hidden">
      <div className="glass-strong rounded-full px-4 py-3 flex gap-8 items-center">
        <MobileNavItem icon={<Home />} href="/dashboard" />
        <MobileNavItem icon={<MessageSquare />} href="/chat" />
        <MobileNavItem icon={<Calendar />} href="/calendar" />
        <MobileNavItem icon={<CheckSquare />} href="/planner" />
        <MobileNavItem icon={<User />} href="/profile" />
      </div>
    </nav>
  );
};

const MobileNavItem = ({ icon, href }) => {
  const isActive = useLocation().pathname === href;
  
  return (
    <Link to={href} className={`w-8 h-8 flex items-center justify-center transition-all duration-200 ${
      isActive ? 'text-indigo-neon-600 glow-indigo' : 'text-gray-400'
    }`}>
      {icon}
    </Link>
  );
};
```

### Layout Wrapper

```tsx
// src/layouts/AppLayout.tsx
export const AppLayout = ({ children }) => {
  return (
    <div className="flex">
      {/* Desktop nav */}
      <div className="hidden sm:block">
        <DesktopNav />
      </div>
      
      {/* Content area */}
      <main className="flex-1 sm:ml-16 mb-20 sm:mb-0">
        {children}
      </main>
      
      {/* Mobile nav */}
      <MobileNav />
    </div>
  );
};
```

---

## Part 3: Core UI Components

### Button Component

```tsx
// src/components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  ...props 
}: ButtonProps) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-neon-600 focus-visible:ring-offset-2 focus-visible:ring-offset-void-950 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-neon-600 text-void-950 hover:bg-indigo-neon-500 hover:glow-indigo active:scale-95',
    secondary: 'bg-glass text-indigo-neon-600 hover:bg-glass-strong hover:text-indigo-neon-500 border border-indigo-neon-600/20',
    ghost: 'text-gray-400 hover:text-indigo-neon-600 hover:bg-glass',
    danger: 'bg-danger text-white hover:bg-red-600 active:scale-95',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

### Card Component

```tsx
// src/components/ui/Card.tsx
interface CardProps {
  variant?: 'default' | 'glass' | 'elevated';
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ variant = 'default', children, className = '' }: CardProps) => {
  const variants = {
    default: 'bg-void-800 border border-void-700 rounded-2xl',
    glass: 'glass rounded-2xl',
    elevated: 'bg-void-800 border border-indigo-neon-600/10 rounded-2xl shadow-lg glow-indigo',
  };
  
  return (
    <div className={`${variants[variant]} p-6 ${className}`}>
      {children}
    </div>
  );
};
```

### Input Component

```tsx
// src/components/ui/Input.tsx
interface InputProps {
  label?: string;
  error?: string;
  variant?: 'default' | 'underline';
  [key: string]: any;
}

export const Input = ({ label, error, variant = 'default', ...props }: InputProps) => {
  const baseStyles = 'w-full font-medium text-base transition-all duration-200 focus-visible:outline-none';
  
  const variants = {
    default: 'bg-glass border border-indigo-neon-600/20 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus-visible:border-indigo-neon-600 focus-visible:glow-indigo',
    underline: 'bg-transparent border-b-2 border-gray-600 rounded-none px-0 py-2 text-gray-100 placeholder-gray-500 focus-visible:border-indigo-neon-600',
  };
  
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
      <input 
        className={`${baseStyles} ${variants[variant]}`}
        {...props}
      />
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
};
```

### Badge Component

```tsx
// src/components/ui/Badge.tsx
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}

export const Badge = ({ variant = 'default', children }: BadgeProps) => {
  const variants = {
    default: 'bg-indigo-neon-600/20 text-indigo-neon-300 border border-indigo-neon-600/30',
    success: 'bg-success/20 text-success border border-success/30',
    warning: 'bg-warning/20 text-warning border border-warning/30',
    danger: 'bg-danger/20 text-danger border border-danger/30',
    info: 'bg-info/20 text-info border border-info/30',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};
```

---

## Part 4: Page Redesigns

### 1. Auth Pages (Sign In / Sign Up)

**Design**: Full-screen split layout
- Left: Rich visual panel with animated mesh gradient (use hero image)
- Right: Minimal frosted glass form card

**Key Elements**:
- Form floats on frosted glass card (no borders, soft shadow)
- Input fields use underline-only style with animated focus
- Single CTA button with gradient fill and glow on hover
- Divider with "or" text
- Links styled as gradient text

**Implementation Structure**:
```tsx
// src/pages/auth/SignInPage.tsx
export const SignInPage = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left: Visual Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative" 
           style={{ backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/...auth-hero.png)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-void-950/80 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
          <h1 className="text-5xl font-bold mb-4">Your AI-powered academic co-pilot</h1>
          <p className="text-xl text-gray-300">Get personalized study recommendations, track your progress, and ace your courses.</p>
        </div>
      </div>
      
      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-void-950">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-white">Welcome back</h2>
          <p className="text-gray-400 mb-8">Sign in to your account to continue</p>
          
          <form className="space-y-6">
            <Input label="Email" type="email" placeholder="you@university.edu" variant="underline" />
            <Input label="Password" type="password" placeholder="••••••••" variant="underline" />
            
            <Button variant="primary" size="lg" className="w-full">
              Sign In
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-void-950 text-gray-500">or</span>
              </div>
            </div>
            
            <p className="text-center text-gray-400">
              Don't have an account? <Link to="/auth/sign-up" className="text-gradient font-medium">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
```

### 2. Dashboard

**Design**: Hero zone + content cards
- Hero: Large greeting ("Good morning, Alex") + live GPA badge
- Stat cards: Horizontal scrollable on mobile, 3-column grid on desktop
- Each stat card: vivid left-border accent, large number, mini SVG sparkline
- GPA trend chart: full-width area chart with gradient fill, no grid lines
- Next Tasks: vertical timeline with colored left border dots
- At-Risk Courses: horizontal cards with warning amber glow

**Implementation Structure**:
```tsx
// src/pages/dashboard/DashboardPage.tsx
export const DashboardPage = () => {
  return (
    <AppLayout>
      <div className="p-6 lg:p-12">
        {/* Hero Zone */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">Good morning, Alex</h1>
          <p className="text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <div className="mt-4 inline-block">
            <Badge variant="info">GPA: 3.87</Badge>
          </div>
        </div>
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard title="Current GPA" value="3.87" trend="+0.12" icon={<TrendingUp />} />
          <StatCard title="Assignments Due" value="5" trend="This week" icon={<FileText />} />
          <StatCard title="Study Streak" value="12 days" trend="Keep it up!" icon={<Flame />} />
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <Card variant="glass">
            <h3 className="text-xl font-bold text-white mb-4">GPA Trend</h3>
            {/* Recharts LineChart here */}
          </Card>
          
          <Card variant="glass">
            <h3 className="text-xl font-bold text-white mb-4">Study Time by Course</h3>
            {/* Recharts BarChart here */}
          </Card>
        </div>
        
        {/* Next Tasks Timeline */}
        <Card variant="glass">
          <h3 className="text-xl font-bold text-white mb-6">Next Tasks</h3>
          <div className="space-y-4">
            <TimelineItem priority="high" title="Midterm Exam" dueDate="Mar 25" />
            <TimelineItem priority="medium" title="Project Submission" dueDate="Mar 28" />
            <TimelineItem priority="low" title="Reading Assignment" dueDate="Apr 2" />
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

const StatCard = ({ title, value, trend, icon }) => (
  <Card variant="elevated" className="border-l-4 border-indigo-neon-600">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm mb-2">{title}</p>
        <p className="text-4xl font-bold text-white">{value}</p>
        <p className="text-teal-neon-600 text-xs mt-2">{trend}</p>
      </div>
      <div className="text-indigo-neon-600 opacity-50">{icon}</div>
    </div>
  </Card>
);

const TimelineItem = ({ priority, title, dueDate }) => {
  const priorityColors = {
    high: 'bg-danger',
    medium: 'bg-warning',
    low: 'bg-success',
  };
  
  return (
    <div className="flex gap-4 items-start">
      <div className={`w-3 h-3 rounded-full mt-2 ${priorityColors[priority]}`} />
      <div className="flex-1">
        <p className="text-white font-medium">{title}</p>
        <p className="text-gray-500 text-sm">Due {dueDate}</p>
      </div>
    </div>
  );
};
```

### 3. Chat Page

**Design**: Full-height, message-focused
- Messages from user: right-aligned, electric indigo gradient bubble
- Messages from AI: left-aligned, frosted glass card with indigo left border glow
- Input bar: fixed at bottom, full-width frosted glass pill
- Empty state: centered orb animation with quick-starter prompts
- Context sidebar: pull-out drawer (floating chip on right edge)

**Implementation Structure**:
```tsx
// src/pages/chat/ChatPage.tsx
export const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [showContext, setShowContext] = useState(false);
  
  return (
    <AppLayout>
      <div className="flex h-screen">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <EmptyState />
            ) : (
              messages.map((msg, i) => (
                <Message key={i} message={msg} />
              ))
            )}
          </div>
          
          {/* Input Bar */}
          <div className="sticky bottom-0 p-6 bg-gradient-to-t from-void-950 to-transparent">
            <div className="glass-strong rounded-full flex items-center gap-2 p-2">
              <textarea 
                className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus-visible:outline-none p-3"
                placeholder="Ask me anything..."
                rows="1"
              />
              <button className="w-10 h-10 rounded-full bg-indigo-neon-600 text-void-950 flex items-center justify-center hover:glow-indigo transition-all">
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Context Drawer */}
        {showContext && (
          <div className="w-80 bg-void-900 border-l border-indigo-neon-600/10 p-6 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">Context</h3>
            {/* Context items */}
          </div>
        )}
        
        {/* Context Toggle Chip */}
        <button 
          onClick={() => setShowContext(!showContext)}
          className="fixed right-6 bottom-24 glass-strong rounded-full px-4 py-2 text-sm text-indigo-neon-600 hover:glow-indigo transition-all"
        >
          Context
        </button>
      </div>
    </AppLayout>
  );
};

const Message = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${
        isUser 
          ? 'bg-gradient-to-r from-indigo-neon-600 to-indigo-neon-500 text-void-950 rounded-3xl rounded-tr-sm' 
          : 'glass rounded-3xl rounded-tl-sm border-l-2 border-indigo-neon-600'
      } p-4`}>
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="h-full flex flex-col items-center justify-center gap-8">
    {/* Animated orb */}
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-neon-600/20 to-teal-neon-600/20 animate-pulse glow-indigo-lg" />
    
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-2">What can I help you with?</h2>
      <p className="text-gray-400">Ask me about your courses, study tips, or academic planning</p>
    </div>
    
    {/* Quick prompts */}
    <div className="grid grid-cols-2 gap-3">
      <QuickPrompt text="Study tips for exams" />
      <QuickPrompt text="Course recommendations" />
      <QuickPrompt text="Time management" />
      <QuickPrompt text="GPA improvement" />
    </div>
  </div>
);

const QuickPrompt = ({ text }) => (
  <button className="glass rounded-lg px-4 py-2 text-sm text-gray-300 hover:text-indigo-neon-600 hover:border-indigo-neon-600/50 transition-all">
    {text}
  </button>
);
```

### 4. Calendar Page

**Design**: Month view with event pills
- Cells: dark background, events as vivid colored pills
- Color coding: exam=red, class=indigo, study=teal, other=gray
- Selected day: bottom sheet (mobile) or side panel (desktop)
- Toolbar: minimal, centered, large arrow buttons

**Implementation Structure**:
```tsx
// src/pages/calendar/CalendarPage.tsx
export const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  return (
    <AppLayout>
      <div className="p-6 lg:p-12">
        {/* Toolbar */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <button className="text-2xl text-gray-400 hover:text-indigo-neon-600">←</button>
          <h2 className="text-3xl font-bold text-white min-w-48 text-center">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button className="text-2xl text-gray-400 hover:text-indigo-neon-600">→</button>
        </div>
        
        {/* Calendar Grid */}
        <Card variant="glass" className="p-8">
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-gray-500 text-sm font-medium py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar cells */}
            {/* Generate calendar grid here */}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

const CalendarCell = ({ date, events, isSelected, onSelect }) => {
  const eventColors = {
    exam: 'bg-danger',
    class: 'bg-indigo-neon-600',
    study: 'bg-teal-neon-600',
    other: 'bg-gray-600',
  };
  
  return (
    <div 
      onClick={() => onSelect(date)}
      className={`min-h-24 p-2 rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? 'bg-indigo-neon-600/20 border border-indigo-neon-600' 
          : 'bg-void-800 border border-void-700 hover:border-indigo-neon-600/50'
      }`}
    >
      <p className="text-sm font-medium text-gray-300 mb-2">{date.getDate()}</p>
      <div className="space-y-1">
        {events.map((event, i) => (
          <div key={i} className={`${eventColors[event.type]} rounded px-2 py-1 text-xs text-white truncate`}>
            {event.title}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 5. Planner Page

**Design**: Three-column layout (desktop)
- Columns: Courses | Assignments | Tasks
- Each in frosted glass column card
- Items as draggable-looking cards with priority color dot
- Empty columns: dashed border with + icon
- Add buttons: floating + icons at bottom-right of each column

**Implementation Structure**:
```tsx
// src/pages/planner/PlannerPage.tsx
export const PlannerPage = () => {
  return (
    <AppLayout>
      <div className="p-6 lg:p-12">
        <h1 className="text-4xl font-bold text-white mb-12">Planner</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses Column */}
          <PlannerColumn title="Courses" items={courses} emptyMessage="No courses yet" />
          
          {/* Assignments Column */}
          <PlannerColumn title="Assignments" items={assignments} emptyMessage="No assignments" />
          
          {/* Tasks Column */}
          <PlannerColumn title="Tasks" items={tasks} emptyMessage="No tasks" />
        </div>
      </div>
    </AppLayout>
  );
};

const PlannerColumn = ({ title, items, emptyMessage }) => (
  <Card variant="glass" className="relative min-h-96">
    <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
    
    {items.length === 0 ? (
      <div className="h-64 border-2 border-dashed border-indigo-neon-600/30 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Plus className="w-8 h-8 text-indigo-neon-600/50 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">{emptyMessage}</p>
        </div>
      </div>
    ) : (
      <div className="space-y-3">
        {items.map((item, i) => (
          <PlannerItem key={i} item={item} />
        ))}
      </div>
    )}
    
    {/* Add button */}
    <button className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-indigo-neon-600 text-void-950 flex items-center justify-center hover:glow-indigo transition-all">
      <Plus size={20} />
    </button>
  </Card>
);

const PlannerItem = ({ item }) => {
  const priorityColors = {
    high: 'bg-danger',
    medium: 'bg-warning',
    low: 'bg-success',
  };
  
  return (
    <div className="bg-void-800 rounded-lg p-3 flex items-start gap-3 hover:bg-void-750 transition-all cursor-grab active:cursor-grabbing">
      <div className={`w-2 h-2 rounded-full mt-1.5 ${priorityColors[item.priority]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{item.title}</p>
        <p className="text-gray-500 text-xs">{item.dueDate}</p>
      </div>
    </div>
  );
};
```

### 6. Profile Page

**Design**: Centered card layout
- Avatar at top with gradient ring
- Fields use underline-only input style
- Stats displayed as horizontal pill row
- Edit button for each section

**Implementation Structure**:
```tsx
// src/pages/profile/ProfilePage.tsx
export const ProfilePage = () => {
  return (
    <AppLayout>
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card variant="glass" className="w-full max-w-md">
          {/* Avatar */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-neon-600 to-teal-neon-600 p-1">
              <div className="w-full h-full rounded-full bg-void-900 flex items-center justify-center">
                <User className="w-12 h-12 text-indigo-neon-600" />
              </div>
            </div>
          </div>
          
          {/* Name */}
          <h2 className="text-2xl font-bold text-white text-center mb-2">Alex Johnson</h2>
          <p className="text-gray-400 text-center mb-8">alex@university.edu</p>
          
          {/* Stats */}
          <div className="flex justify-center gap-4 mb-8">
            <StatPill label="GPA" value="3.87" />
            <StatPill label="Year" value="Junior" />
            <StatPill label="Major" value="CS" />
          </div>
          
          {/* Form Fields */}
          <form className="space-y-6">
            <Input label="Full Name" defaultValue="Alex Johnson" variant="underline" />
            <Input label="Email" defaultValue="alex@university.edu" variant="underline" />
            <Input label="Major" defaultValue="Computer Science" variant="underline" />
            <Input label="Year" defaultValue="Junior" variant="underline" />
            
            <Button variant="primary" size="lg" className="w-full">
              Save Changes
            </Button>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

const StatPill = ({ label, value }) => (
  <div className="bg-void-800 rounded-full px-4 py-2 text-center">
    <p className="text-gray-500 text-xs">{label}</p>
    <p className="text-white font-bold text-sm">{value}</p>
  </div>
);
```

---

## Part 5: Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Update `tailwind.config.cjs` with Neural Canvas colors
- [ ] Update `src/styles/globals.css` with new typography and utilities
- [ ] Create core UI components (Button, Card, Input, Badge)
- [ ] Build navigation system (DesktopNav, MobileNav, AppLayout)

### Phase 2: Pages (Week 2)
- [ ] Redesign Auth pages (SignIn, SignUp)
- [ ] Redesign Dashboard
- [ ] Redesign Chat
- [ ] Update index.html with Syne font import

### Phase 3: Remaining Pages (Week 3)
- [ ] Redesign Calendar
- [ ] Redesign Planner
- [ ] Redesign Profile
- [ ] Test all pages for responsiveness

### Phase 4: Polish & Deploy (Week 4)
- [ ] Test all API integrations
- [ ] Verify animations and transitions
- [ ] Test on mobile devices
- [ ] Create REDESIGN_COMPLETE.md
- [ ] Push to main branch

---

## Part 6: Key Technical Notes

### Preserving API Integration

All existing API calls remain unchanged. The redesign only affects:
- Component structure and styling
- Layout and navigation
- Visual presentation

**DO NOT MODIFY**:
- `src/api/` - API client and endpoints
- `src/context/` - Auth and Toast context
- `src/hooks/` - Custom hooks
- `src/routes/AppRoutes.tsx` - Routing logic
- `src/mocks/` - Mock data

### Responsive Design Strategy

**Mobile-first approach**:
1. Design for 375px (small phone)
2. Tablet breakpoint: 768px (sm: in Tailwind)
3. Desktop breakpoint: 1024px (lg: in Tailwind)
4. Large desktop: 1440px (xl: in Tailwind)

**Navigation**:
- Mobile: Bottom tab bar (fixed)
- Desktop: Left icon rail (fixed)
- Content adjusts margins accordingly

### Performance Considerations

1. **Images**: Use generated hero images (already created)
2. **Animations**: Keep max 300ms, use GPU-accelerated transforms
3. **Bundle size**: Rely on existing dependencies (Framer Motion, Recharts, etc.)
4. **Lazy loading**: Implement for chart components if needed

---

## Part 7: Design Tokens Reference

### Quick Copy-Paste Values

```css
/* Colors */
--void-950: #080B14;
--indigo-neon-600: #6C63FF;
--teal-neon-600: #00D2C8;

/* Glassmorphism */
background: rgba(13, 17, 23, 0.4);
backdrop-filter: blur(20px);
border: 1px solid rgba(108, 99, 255, 0.1);

/* Shadows */
box-shadow: 0 0 20px rgba(108, 99, 255, 0.3);

/* Transitions */
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);

/* Focus Ring */
outline: 2px solid #6C63FF;
outline-offset: 2px;
```

---

## Part 8: Common Patterns

### Animated Entrance
```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Hover Glow Effect
```tsx
className="hover:shadow-glow-indigo hover:shadow-glow-indigo-lg transition-all duration-200"
```

### Gradient Text
```tsx
className="bg-gradient-to-r from-indigo-neon-600 to-teal-neon-600 bg-clip-text text-transparent"
```

### Glass Card
```tsx
<Card variant="glass" className="rounded-2xl p-6">
  Content
</Card>
```

---

## Part 9: Troubleshooting

**Issue**: Colors don't match design
- **Solution**: Verify Tailwind config has correct color values. Check `tailwind.config.cjs` for `indigo-neon` and `teal-neon` definitions.

**Issue**: Glassmorphism not working
- **Solution**: Ensure `-webkit-backdrop-filter` is included. Check browser support (Safari requires `-webkit-` prefix).

**Issue**: Navigation not responsive
- **Solution**: Verify `hidden sm:block` and `sm:hidden` classes are applied correctly. Test at 375px and 768px breakpoints.

**Issue**: Animations too slow
- **Solution**: Reduce `duration-300` to `duration-200`. Ensure `cubic-bezier(0.4, 0, 0.2, 1)` easing is used.

---

## Part 10: Next Steps

1. **Start with Phase 1**: Set up design tokens and navigation
2. **Test navigation**: Verify mobile/desktop switching works
3. **Build one page at a time**: Start with Auth, then Dashboard
4. **Test API integration**: Ensure all data flows correctly
5. **Iterate on design**: Refine based on testing and feedback
6. **Deploy**: Push to main branch when complete

---

**Good luck with the Neural Canvas redesign! This is a radical departure from the previous design, so take time to get the foundation right before building pages.**
