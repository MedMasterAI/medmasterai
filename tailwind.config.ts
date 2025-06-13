/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx,js,jsx}',
    './src/components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Variables conectadas al sistema CSS
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        'card-border': 'var(--card-border)',

        sidebar: 'var(--sidebar)',
        'sidebar-foreground': 'var(--sidebar-foreground)',
        'sidebar-primary': 'var(--sidebar-primary)',
        'sidebar-primary-foreground': 'var(--sidebar-primary-foreground)',
        'sidebar-accent': 'var(--sidebar-accent)',
        'sidebar-accent-foreground': 'var(--sidebar-accent-foreground)',
        'sidebar-border': 'var(--sidebar-border)',

        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',

        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',

        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',

        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',

        text: 'var(--text)',
        'text-secondary': 'var(--text-secondary)',

        input: 'var(--input)',
        ring: 'var(--ring)',

        destructive: 'var(--destructive)', // si lo tenés en tus vars
      },

      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        card: '1.25rem',
        full: '9999px',
        DEFAULT: '0.75rem',
      },

      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },

      boxShadow: {
        card: '0 4px 20px rgba(126, 87, 194, 0.07)',
        cardHover: '0 6px 24px rgba(126, 87, 194, 0.12)',
        button: '0 2px 8px rgba(126, 87, 194, 0.12)',
        xs: '0 1px 2px rgba(0,0,0,0.04)',
        sm: '0 1px 3px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
}