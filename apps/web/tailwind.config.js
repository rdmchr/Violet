module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridRowStart: {
        '8': '8',
        '9': '9',
        '10': '10',
      },
      gridTemplateRows: {
        // Used for timetable
        'timetable': 'max-content repeat(8, 50px)',

        // Complex site-specific row configuration
        'layout': '200px minmax(900px, 1fr) 100px',
      },
      gridTemplateCols: {
        'timetable-week': 'repeat(6, max-content)'
      }
    },
  },
  plugins: [],
}
