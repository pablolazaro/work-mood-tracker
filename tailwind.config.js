/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper:      '#f4ede1',
        'paper-2':  '#ece3d3',
        card:       '#fffaf2',
        ink:        '#2a241c',
        'ink-2':    '#5a4f41',
        muted:      '#9a8e79',
        hair:       '#e2d8c5',
        good:       '#3f7d58',
        'good-bg':  '#dce8dc',
        bad:        '#b94a4a',
        'bad-bg':   '#f1dcdb',
        off:        '#c9b892',
        'off-bg':   '#ece3cb',
        'off-ink':  '#8a7a55',
        accent:     '#b05a35',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
