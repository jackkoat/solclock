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
        // Enhanced SolPulse blue-purple theme
        primary: {
          blue: '#0EA5E9',      // Bright blue
          purple: '#8B5CF6',    // Vibrant purple
          'blue-dark': '#0284C7',   // Darker blue
          'purple-dark': '#7C3AED', // Darker purple
          'blue-light': '#38BDF8',  // Light blue
          'purple-light': '#A78BFA', // Light purple
        },
        bg: {
          primary: '#0F0F23',      // Dark blue-black
          secondary: '#1A1A2E',    // Dark blue
          tertiary: '#16213E',     // Medium blue
          accent: '#0F3460',       // Accent blue
        },
        text: {
          primary: '#E2E8F0',      // Light gray
          secondary: '#CBD5E1',    // Medium gray
          tertiary: '#94A3B8',     // Darker gray
        },
        border: {
          light: '#334155',        // Dark gray-blue
          medium: '#475569',       // Medium gray-blue
        },
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        // Pulse effect colors
        'pulse-blue': '#0EA5E9',
        'pulse-purple': '#8B5CF6',
        'pulse-cyan': '#06B6D4',
        'pulse-indigo': '#6366F1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(14, 165, 233, 0.3)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
      },
      animation: {
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'pulse-bg': 'pulseBg 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.1)' },
        },
        pulseBg: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'pulse-gradient': 'linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 50%, #06B6D4 100%)',
      }
    },
  },
  plugins: [],
};

export default config;
