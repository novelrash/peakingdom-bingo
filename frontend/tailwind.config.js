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
          base: '#020202',
          raised: '#1e1e28',
          overlay: '#26262f',
        },
      },
      boxShadow: {
        'gold-sm': '0 0 28px rgba(232,224,255,0.13), 0 0 8px rgba(167,139,250,0.10)',
        'gold-md': '0 0 48px rgba(232,224,255,0.20), 0 0 16px rgba(167,139,250,0.16)',
      },
    },
  },
  plugins: [],
}
