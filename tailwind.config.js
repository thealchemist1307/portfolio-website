/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
          keyframes: {
            'checker-scroll': {
              '0%':   { 'background-position':   '0 0' },
              '100%': { 'background-position': '-160px 0' }
            }
          },
          animation: {
            'checker-scroll': 'checker-scroll 6s linear infinite'
          }
        }
      },
      plugins: []
  }
  