// tailwind.config.ts - Configuration Tailwind pour Mah.AI

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs principales
        teal: '#0AFFE0',
        teal2: '#00C9A7',
        green: '#00FF88',
        gold: '#FFD166',
        rose: '#FF6B9D',
        blue: '#4F8EF7',
        purple: '#A78BFA',
        orange: '#FF9F43',

        // Backgrounds
        bg: '#060910',
        bg2: '#0C1220',
        bg3: '#111928',
        bg4: '#080E1C',

        // Borders
        border: 'rgba(255, 255, 255, 0.07)',
        border2: 'rgba(10, 255, 224, 0.22)',

        // Text
        text: '#F0F4FF',
        muted: '#6B7899',
        muted2: '#3A4560',
      },
      fontFamily: {
        sans: ['var(--font-bricolage)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      borderRadius: {
        'mah': '16px',
        'mah-lg': '20px',
      },
      animation: {
        'float': 'float 20s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.6s ease both',
        'fade-in': 'fadeIn 0.2s ease',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(20px, -15px) scale(1.04)' },
          '100%': { transform: 'translate(-15px, 20px) scale(0.97)' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
          'to': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(-6px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
