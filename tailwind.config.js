/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        ellaia: {
          magenta: '#D81B60',
          coral: '#FF6F61',
          electric: '#0EA5E9',
          ink: '#0B0B0C',
          stone: '#F5F5F6',
          muted: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}