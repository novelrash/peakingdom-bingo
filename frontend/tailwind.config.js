export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        osrs: {
          gold: '#ffb000',
          'gold-bright': '#ffd700',
          bronze: '#cd7f32',
        },
        surface: {
          base: '#0a0a0a',
          raised: '#1a1a1a',
          overlay: '#2a2a2a',
        },
      },
    },
  },
  plugins: [],
}
