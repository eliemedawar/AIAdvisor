/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Sora",
          "Inter var",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif"
        ],
        display: [
          "Sora",
          "Inter",
          "-apple-system",
          "system-ui",
          "sans-serif"
        ],
        body: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif"
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Courier New",
          "monospace"
        ]
      },
      colors: {
        // Primary: Deep Sapphire Blue (trustworthy, professional)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93bbfd',
          400: '#5b91fa',
          500: '#0d5eff',
          600: '#0b4fd9',
          700: '#0a3fb0',
          800: '#0d3491',
          900: '#102d75',
          950: '#0a1a47',
        },
        // Accent: Electric Purple (energetic, tech-forward, AI)
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        // Secondary: Teal (system/status indicators)
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Semantic colors
        success: {
          500: '#14b8a6',
          600: '#0d9488'
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706'
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626'
        },
        error: {
          500: '#ef4444',
          600: '#dc2626'
        },
        info: {
          500: '#0d5eff',
          600: '#0b4fd9'
        },
        // Dark theme foundations
        bg: {
          DEFAULT: '#020617',
          elevated: '#0f172a',
          subtle: '#1e293b',
          card: 'rgba(15, 23, 42, 0.6)',
        },
        // Surface tier system - 4-level hierarchy
        surface: {
          background: '#020617',
          base: '#0f172a',
          elevated: '#1e293b',
          overlay: 'rgba(15, 23, 42, 0.95)',
        },
        // Surface tier system (new unified system)
        surface: {
          background: '#020617',
          base: '#0f172a',
          elevated: '#1e293b',
          overlay: 'rgba(15, 23, 42, 0.95)',
        },
        border: {
          DEFAULT: 'rgba(51, 65, 85, 0.6)',
          light: 'rgba(71, 85, 105, 0.4)',
          strong: 'rgba(100, 116, 139, 0.8)',
        }
      },
      fontSize: {
        // Responsive type scale with line-height and letter-spacing
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'xl': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0' }],
        '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.005em' }],
        '3xl': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        '4xl': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        // Heading-specific sizes
        'h1-mobile': ['2rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h1-tablet': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h1-desktop': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h2-mobile': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'h2-tablet': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'h2-desktop': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'h3-mobile': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'h3-tablet': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'h3-desktop': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'h4-mobile': ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.005em' }],
        'h4-tablet': ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.005em' }],
        'h4-desktop': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.005em' }],
        // Special sizes
        'subtitle-mobile': ['1.125rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'subtitle-tablet': ['1.25rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'subtitle-desktop': ['1.375rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'overline': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
      },
      boxShadow: {
        // Legacy shadows (deprecated)
        'xs': '0 1px 2px rgba(0, 0, 0, 0.4)',
        'sm': '0 2px 4px rgba(0, 0, 0, 0.5)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.6)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.7)',
        'xl': '0 16px 48px rgba(0, 0, 0, 0.8)',
        'soft': '0 20px 50px -12px rgba(0, 0, 0, 0.8)',
        'glow': '0 0 20px rgba(13, 94, 255, 0.4)',
        'glow-primary': '0 0 20px rgba(13, 94, 255, 0.4)',
        'glow-accent': '0 0 20px rgba(168, 85, 247, 0.4)',
        'glow-secondary': '0 0 20px rgba(20, 184, 166, 0.4)',
        // World-class elevation system (directional, layered shadows - light from top-left)
        // Each shadow combines ambient (soft, diffused) + key light (sharper, directional)
        'elevation-flat': 'none',
        'elevation-low': '0 1px 2px -1px rgba(0, 0, 0, 0.35), 0 1px 3px 0 rgba(0, 0, 0, 0.25)',
        'elevation-mid': '0 2px 4px -1px rgba(0, 0, 0, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        'elevation-high': '0 4px 8px -2px rgba(0, 0, 0, 0.45), 0 8px 16px -4px rgba(0, 0, 0, 0.35)',
        'elevation-overlay': '0 8px 16px -4px rgba(0, 0, 0, 0.5), 0 20px 40px -8px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        'xs': '0.25rem',   // 4px
        'sm': '0.5rem',    // 8px
        'md': '0.75rem',   // 12px
        'lg': '1rem',      // 16px
        'xl': '1.25rem',   // 20px
        '2xl': '1.5rem',   // 24px
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        64: '16rem',
        80: '20rem',
      },
      maxWidth: {
        '8xl': '88rem'
      },
      transitionDuration: {
        'quick': '120ms',
        'base': '160ms',
        'slow': '240ms',
        'slower': '320ms',
      },
      transitionTimingFunction: {
        'snappy': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'enter': 'cubic-bezier(0, 0, 0.2, 1)',
        'exit': 'cubic-bezier(0.4, 0, 1, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'pulse-dots': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.9)' },
          '50%': { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'fade-in-down': 'fade-in-down 0.4s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'pulse-dots': 'pulse-dots 1.4s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite'
      },
      backdropBlur: {
        xs: '2px'
      },
      // Motion system tokens
      transitionDuration: {
        'quick': '120ms',
        'base': '160ms',
        'slow': '240ms',
        'slower': '320ms',
      },
      transitionTimingFunction: {
        'snappy': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'enter': 'cubic-bezier(0, 0, 0.2, 1)',
        'exit': 'cubic-bezier(0.4, 0, 1, 1)',
      }
    }
  },
  plugins: []
};
