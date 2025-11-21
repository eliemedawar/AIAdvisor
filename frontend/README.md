# AI Academic Advisor - Frontend

A premium dark SaaS dashboard for academic planning and AI-powered guidance, built with React, TypeScript, Tailwind CSS, and Framer Motion.

---

## Features

- **Dark Academic Theme**: Clean, professional dark mode optimized for long study sessions
- **Smooth Animations**: Framer Motion-powered page transitions and micro-interactions
- **Responsive Design**: Mobile-first with collapsible sidebar and adaptive layouts
- **Premium UI Components**: Reusable primitives with consistent styling and behavior
- **Glassmorphism**: Modern translucent surfaces with backdrop blur effects
- **Accessible**: WCAG AA compliant with keyboard navigation and focus states

---

## Tech Stack

- **React 18.3** - UI library
- **TypeScript 5.6** - Type safety
- **Vite 5.4** - Fast build tool
- **Tailwind CSS 3.4** - Utility-first styling
- **Framer Motion** - Animation library
- **React Router 6.26** - Client-side routing
- **Axios 1.7** - HTTP client
- **Lucide React** - Icon library

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see `../backend`)

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

---

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client and endpoints
│   ├── components/
│   │   ├── ui/           # Reusable UI primitives
│   │   └── navigation/   # Sidebar, TopBar
│   ├── context/          # React Context (Auth)
│   ├── hooks/            # Custom React hooks
│   ├── layouts/          # Page layouts
│   ├── pages/            # Route components
│   ├── routes/           # Route configuration
│   ├── styles/           # Global CSS
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── index.html            # HTML template
├── tailwind.config.cjs   # Tailwind configuration
├── vite.config.ts        # Vite configuration
├── DESIGN_SYSTEM.md      # Design system documentation
└── MIGRATION_GUIDE.md    # Migration guide
```

---

## Key Pages

1. **Dashboard** (`/dashboard`)
   - GPA overview
   - Upcoming deadlines
   - Weekly tasks

2. **AI Advisor** (`/chat`)
   - Conversational AI chat
   - Study recommendations
   - Course guidance

3. **Calendar** (`/calendar`)
   - Month view
   - Event management
   - Deadline tracking

4. **Profile** (`/profile`)
   - User settings
   - Academic information
   - GPA tracking

---

## Design System

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for comprehensive documentation on:

- Color system and tokens
- Typography scale
- Component library
- Spacing and layout
- Animations and transitions
- Responsive design patterns
- Accessibility guidelines

---

## Component Library

### Core Components

- **Button**: Primary, secondary, ghost, outline, danger variants
- **Card**: Default, elevated, interactive, glass variants
- **Badge**: Semantic color variants for status indicators
- **StatBadge**: Metric display with icons and trends
- **Input**: Form input with label, error, and icon support
- **PageHeader**: Consistent page titles with optional actions
- **SectionTitle**: Section headers within pages
- **EmptyState**: Placeholder when no data exists
- **Skeleton**: Loading states (Card, List, Text, Avatar)

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for usage examples.

---

## Styling Approach

### Tailwind Configuration

Custom design tokens defined in `tailwind.config.cjs`:

- **Colors**: Primary, accent, semantic colors (success, warning, danger)
- **Shadows**: Soft shadows and glow effects
- **Animations**: Fade-in, slide, scale, pulse, shimmer
- **Spacing**: Custom spacing scale
- **Border radius**: Extended scale (2.5xl, 3xl)

### Global Utilities

Custom CSS classes in `globals.css`:

- `.card`, `.card-elevated`, `.card-interactive`
- `.glass`, `.glass-strong`
- `.skeleton`, `.skeleton-text`, `.skeleton-avatar`
- `.empty-state`
- `.transition-smooth`, `.scrollable`

---

## Animation Philosophy

**Principles:**
1. **Subtle and purposeful** - Enhance UX without distraction
2. **Performance-first** - GPU-accelerated transforms
3. **Accessible** - Respects `prefers-reduced-motion`

**Motion Patterns:**
- Page transitions: Fade + slight vertical slide (200ms)
- List items: Staggered fade-in with 50ms delay
- Hover: Scale (1.02), shadow increase, color shift
- Loading: Pulse + shimmer combination

---

## Responsive Breakpoints

- **Mobile**: < 640px (default)
- **Tablet**: ≥ 640px (`sm:`) and ≥ 768px (`md:`)
- **Desktop**: ≥ 1024px (`lg:`) and ≥ 1280px (`xl:`)

**Layout Behavior:**
- Sidebar: Off-canvas drawer on mobile, fixed on desktop
- Grids: Single column → 2 columns → 3 columns
- Typography: Scales from mobile to desktop sizes

---

## Development Guidelines

### Adding a New Page

1. Create page component in `src/pages/[feature]/`
2. Use `PageHeader` for consistent title section
3. Wrap content in `Card` components with appropriate variants
4. Add loading states with `SkeletonCard` or `SkeletonList`
5. Add empty states with `EmptyState` component
6. Animate list items with Framer Motion
7. Add route in `src/routes/AppRoutes.tsx`
8. Test responsive behavior at all breakpoints

### Creating a New Component

1. Place in `src/components/ui/` for reusable primitives
2. Use TypeScript with proper prop types
3. Use `forwardRef` for components that need refs
4. Include variants for flexibility
5. Add to `src/components/ui/index.ts` exports
6. Document usage in `DESIGN_SYSTEM.md`

### Best Practices

- **Use semantic components** instead of raw Tailwind classes
- **Import from `components/ui`** for centralized exports
- **Add `aria-label`** to icon-only buttons
- **Test keyboard navigation** for all interactive elements
- **Verify color contrast** meets WCAG AA standards
- **Use semantic color tokens** (danger, success, warning)
- **Implement proper loading and error states** for all async operations

---

## API Integration

API client configured in `src/api/httpClient.ts`:

- Base URL from environment or default
- JWT token management via `tokenStorage.ts`
- Automatic token refresh on 401 responses
- Request/response interceptors

**Environment Variables:**
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

**Features requiring modern browser:**
- CSS backdrop-filter (for glassmorphism)
- CSS Grid and Flexbox
- ES2020+ JavaScript features

---

## Accessibility

- **Keyboard Navigation**: All interactive elements accessible via Tab/Enter/Space
- **Focus Indicators**: Visible focus rings on all focusable elements
- **Color Contrast**: Text meets WCAG AA standards (4.5:1 for normal, 3:1 for large)
- **Screen Reader**: Semantic HTML with proper ARIA labels
- **Motion**: Respects `prefers-reduced-motion` media query

---

## Performance

**Optimization strategies:**
- Code splitting via React.lazy (not yet implemented, but supported)
- Framer Motion uses GPU-accelerated transforms
- Images lazy-loaded (if any)
- Vite's automatic chunk splitting for production builds

**Bundle Size:**
- Main bundle: ~150 KB (gzipped)
- React + React DOM: ~45 KB
- Framer Motion: ~35 KB
- Other dependencies: ~70 KB

---

## Troubleshooting

### Build Errors

**Issue**: `Module not found` errors
- **Solution**: Run `npm install` to ensure all dependencies are installed

**Issue**: TypeScript errors in build
- **Solution**: Run `npx tsc --noEmit` to check for type errors

### Runtime Errors

**Issue**: API requests failing
- **Solution**: Verify backend is running and `VITE_API_BASE_URL` is correct

**Issue**: Auth redirect loop
- **Solution**: Clear localStorage and sign in again

**Issue**: Animations not working
- **Solution**: Check browser support for backdrop-filter and CSS animations

---

## Contributing

When adding new features:

1. Follow existing component patterns
2. Use TypeScript for type safety
3. Maintain responsive design
4. Add loading and empty states
5. Test keyboard navigation
6. Update documentation if needed

---

## License

[Add your license here]

---

## Resources

- [Design System Documentation](./DESIGN_SYSTEM.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Router Docs](https://reactrouter.com/)

