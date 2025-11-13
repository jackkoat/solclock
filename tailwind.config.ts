import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SolPulse blue purple theme
        primary: {
          blue: '#13C9E1',  // Cyan blue
          purple: '#8A2BE2', // Purple
          'blue-dark': '#0FA5CC',
          'purple-dark': '#7A1FD9',
        },
        bg: {
          primary: '#FFFFFF',
          secondary: '#F7F9FB',
          tertiary: '#FAFBFC',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
        },
        // Enhanced SolPulse color palette
        'pulse-blue': '#13C9E1',
        'pulse-purple': '#8A2BE2',
        border: {
          light: '#E5E7EB',
          medium: '#D1D5DB',
        },
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.1)' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
