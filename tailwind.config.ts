/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oficial MedMasterAI
        primary: "#7B61FF",                   // Violeta principal
        'primary-dark': "#7B61FF",            // Igual en dark, por si querés diferencia futuro
        digitalBlue: "#3252FF",               // Azul digital para detalles/acciones
        softLila: "#E3D8FF",                  // Lila sidebar/light
        background: "#F7F7FA",                // Fondo claro global
        'background-dark': "#181925",         // Fondo dark
        card: "#FFFFFF",                      // Fondo tarjeta light
        'card-dark': "#23243A",               // Fondo tarjeta dark

        // ---- AQUI EL CAMBIO GLASSY ----
        sidebar: "#E3D8FF",                   // Sidebar light
        'sidebar-dark': "rgba(33,25,77,0.92)", // Sidebar dark GLASSY (translúcido, verás la imagen de fondo)
        // Alternativa hexadecimal: "#21194DEB"  (EB ~ 92% opacidad)
        //----------------------------------

        text: "#1A1B22",                      // Texto principal claro
        'text-dark': "#FFFFFF",               // Texto principal oscuro
        'text-secondary': "#A9A9BC",          // Texto secundario
        border: "#EDEDF7",                    // Bordes
        accent: "#FFE066",                    // Acento/warning
      },
      borderRadius: {
        card: "18px",
        xl: "1rem",
        full: "9999px",
      },
      fontFamily: {
        poppins: ["Poppins", "Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 32px 0 rgba(123, 97, 255, 0.07)",
        cardHover: "0 8px 32px 0 rgba(123, 97, 255, 0.18)",
        button: "0 2px 8px 0 rgba(123, 97, 255, 0.18)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
}
