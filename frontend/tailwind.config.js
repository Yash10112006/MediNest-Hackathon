/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'Plus Jakarta Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        cyan: {
          450: '#00d2ff',
        },
      },
      boxShadow: {
        soft: '0 4px 25px -2px rgba(14, 165, 233, 0.08)',
        card: '0 8px 30px rgba(0, 0, 0, 0.04)',
        glow: '0 0 25px rgba(20, 184, 166, 0.25)',
        'glow-cyan': '0 0 30px rgba(6, 182, 212, 0.35)',
        'glow-purple': '0 0 30px rgba(168, 85, 247, 0.35)',
        'glow-emerald': '0 0 30px rgba(16, 185, 129, 0.35)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'gradient-x': 'gradientX 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 15px rgba(20, 184, 166, 0.6))' },
          '50%': { opacity: 0.7, filter: 'drop-shadow(0 0 5px rgba(20, 184, 166, 0.2))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientX: {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
      },
      backdropBlur: {
        xs: '2px',
        xl: '20px',
      },
    },
  },
  plugins: [],
}