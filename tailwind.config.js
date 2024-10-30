/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        // Simple 16 column grid
        'main': '250px 1fr',

        // Complex site-specific column configuration
        'footer': '200px minmax(900px, 1fr) 100px',
        'tableline_1fr_mc': '1fr repeat(3, max-content)',
        'tableline_mc': '1fr repeat(4, max-content)',
        'tableline_auto': '100px repeat(4, auto)',
        'tableline_auto-17': '100px repeat(17, auto)',
        'tableline_auto-19': '100px 100px 50px repeat(6, auto) 50px repeat(8, auto)',
        'tableline_auto-18': 'repeat(18, 50px)',
      },
      backgroundColor: {
        'myoverlay': 'rgba(0, 0, 0,0.5)'
      },
      borderRadius: {
        'primary': '3px',
        'secondary': '50%',
      },
      padding: {
        'top': '15px 0 0'
      }
    },
  },
  plugins: [],
}

