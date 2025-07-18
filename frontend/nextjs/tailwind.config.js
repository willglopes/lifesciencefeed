module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#005eb8",  // Medscape blue
        accent: "#8c1d40",   // MedicalXpress accent
      },
      fontFamily: {
        sans: ["Roboto", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};