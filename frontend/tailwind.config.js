export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Bebas Neue', 'sans-serif'],
      },
      colors: {
        osrs: {
          gold: '#a78bfa',
          'gold-bright': '#c4b5fd',
          bronze: '#7c3aed',
        },
        surface: {
          base: '#07070f',
          raised: '#0e0e1e',
          overlay: '#161628',
        },
      },
      boxShadow: {
        'gold-sm': '0 0 12px rgba(167,139,250,0.12)',
        'gold-md': '0 0 24px rgba(167,139,250,0.18)',
      },
    },
  },
  plugins: [],
}
