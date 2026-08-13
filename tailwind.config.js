export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F6F3EC',
          raised: '#FFFDF8',
          sunk: '#EDE8DD',
        },
        ink: {
          DEFAULT: '#16211D',
          soft: '#3D4B45',
          muted: '#6E7B74',
          line: '#DAD4C7',
        },
        moss: {
          DEFAULT: '#1F6B54',
          hover: '#195A47',
          soft: '#E3EFEA',
        },
        clay: '#B4573A',
        sand: '#D9A73B',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '14px',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(22, 33, 29, 0.06), 0 12px 32px -18px rgba(22, 33, 29, 0.35)',
      },
    },
  },
}
