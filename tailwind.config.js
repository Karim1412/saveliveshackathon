/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ieee: {
          red: '#e8192c',
          darkred: '#b01020',
          navy: '#003580',
        },
        neon: {
          red: '#ff1a35',
          cyan: '#00f5ff',
          green: '#39ff14',
        },
      },
      fontFamily: {
        display: ['"Orbitron"', 'monospace'],
        body: ['"Exo 2"', 'sans-serif'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-delayed': 'float 4s ease-in-out 1s infinite',
        'pulse-glow-red': 'pulseGlowRed 2s ease-in-out infinite',
        'pulse-glow-cyan': 'pulseGlowCyan 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'scan-line': 'scanLine 0.5s linear',
        'flicker': 'flicker 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlowRed: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(255, 26, 53, 0.4), 0 0 30px rgba(255, 26, 53, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(255, 26, 53, 0.8), 0 0 50px rgba(255, 26, 53, 0.4)' },
        },
        pulseGlowCyan: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 245, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 245, 255, 0.7), 0 0 60px rgba(0, 245, 255, 0.3)' },
        },
        scanLine: {
          '0%': { top: '0%', opacity: '1' },
          '100%': { top: '100%', opacity: '0.5' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.8' },
          '97%': { opacity: '1' },
          '98%': { opacity: '0.6' },
          '99%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
