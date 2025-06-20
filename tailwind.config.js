/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'lime': '#8FE402',
        'lime-dark': '#7DD300',
        'coral': '#FF6B6B',
        'coral-light': '#FF8E8E',
        'orange': '#FFA502',
        'orange-light': '#FFB732',
        'purple': '#6C5CE7',
        'purple-light': '#A29BFE',
        'cream': '#FFF5F5',
        'cream-dark': '#FFF0F0',
        'teal': '#4ECDC4',
        'teal-light': '#6EDDD6',
        'purple-game': '#8B5CF6',
        'blue-game': '#3B82F6',
        'dark-border': '#2D3436',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'float 3s ease-in-out infinite 1s',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite alternate',
        'scale-hover': 'scaleHover 0.2s ease-out',
      },
      boxShadow: {
        'lime': '0 8px 24px rgba(143, 228, 2, 0.3)',
        'coral': '0 8px 24px rgba(255, 107, 107, 0.3)',
        'orange': '0 8px 24px rgba(255, 165, 2, 0.3)',
        'purple': '0 8px 24px rgba(108, 92, 231, 0.3)',
        'teal': '0 8px 24px rgba(78, 205, 196, 0.3)',
        'soft': '0 4px 20px rgba(0, 0, 0, 0.1)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'sticker': '6px 6px 0 #2D3436',
        'sticker-hover': '8px 8px 0 #2D3436',
        'sticker-small': '4px 4px 0 #2D3436',
        'sticker-small-hover': '6px 6px 0 #2D3436',
        'icon-sticker': '2px 2px 0 #2D3436',
      }
    },
  },
  plugins: [],
} 