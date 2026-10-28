/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          canvas: '#0B0F19',
          surface: '#111827',
          border: '#1F2937',
          borderHover: '#374151',
          primary: '#6366F1',
          primaryHover: '#4F46E5',
          liveMic: '#EF4444',
          soundwave: '#10B981',
          subtle: '#9CA3AF',
          muted: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        soundwaveAnim: {
          '0%, 100%': { height: '6px' },
          '50%': { height: '22px' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.85)' },
        }
      },
      animation: {
        'soundwave-1': 'soundwaveAnim 0.9s ease-in-out infinite 0.1s',
        'soundwave-2': 'soundwaveAnim 0.9s ease-in-out infinite 0.3s',
        'soundwave-3': 'soundwaveAnim 0.9s ease-in-out infinite 0.5s',
        'soundwave-4': 'soundwaveAnim 0.9s ease-in-out infinite 0.2s',
        'soundwave-5': 'soundwaveAnim 0.9s ease-in-out infinite 0.4s',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
