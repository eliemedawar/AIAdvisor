/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neural Canvas - Deep Space Dark Theme
        'void': {
          950: '#080B14',  // Void black - base background
          900: '#0D1117',  // Surface dark
          850: '#131820',  // Slightly lighter surface
          800: '#1A1F2E',  // Card background
        },
        // Electric Indigo - Primary
        'indigo-neon': {
          600: '#6C63FF',  // Primary electric indigo
          500: '#7B72FF',  // Lighter variant
          400: '#8A81FF',  // Even lighter
          300: '#9B92FF',  // Light variant
        },
        // Neon Teal - Secondary / Data
        'teal-neon': {
          600: '#00D2C8',  // Secondary neon teal
          500: '#1ADDD4',  // Lighter variant
          400: '#33E8E0',  // Even lighter
          300: '#4DF3EC',  // Light variant
        },
        // Semantic colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'danger': '#EF4444',
        'info': '#3B82F6',
      },
      backgroundColor: {
        'glass': 'rgba(13, 17, 23, 0.4)',
        'glass-strong': 'rgba(13, 17, 23, 0.6)',
      },
      backdropBlur: {
        'glass': '20px',
        'glass-sm': '10px',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Syne', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '0.5': '0.125rem',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '6': '1.5rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',
        'base': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
      boxShadow: {
        'none': 'none',
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'base': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'glow-indigo': '0 0 20px rgba(108, 99, 255, 0.3)',
        'glow-teal': '0 0 20px rgba(0, 210, 200, 0.3)',
        'glow-indigo-lg': '0 0 40px rgba(108, 99, 255, 0.4)',
        'glow-teal-lg': '0 0 40px rgba(0, 210, 200, 0.4)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(108, 99, 255, 0.3)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(108, 99, 255, 0.5)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          'from': { transform: 'translateY(10px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(0, 210, 200, 0.1) 100%)',
      },
    },
  },
  plugins: [],
};
