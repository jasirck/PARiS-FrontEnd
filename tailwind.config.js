
// tailwind.config.js
const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      fontFamily: {
        ubuntu: ['Ubuntu', 'sans-serif'], 
      },
      colors: {
        primary: "#287094", 
      },
    },
  },
  darkMode: "class", 
  plugins: [nextui()], 
};
