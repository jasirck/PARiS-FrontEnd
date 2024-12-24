// module.exports = {
//   content: [
//     "./src/**/*.{js,jsx,ts,tsx}", // Make sure to include all relevant files
//   ],
//   theme: {
//     extend: {
//       fontFamily: {
//         ubuntu: ['Ubuntu', 'sans-serif'], // Add Ubuntu as a custom font
//       },
//     },
//   },
//   plugins: [],
// };


// tailwind.config.js
const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}", // Include NextUI's theme
  ],
  theme: {
    extend: {
      fontFamily: {
        ubuntu: ['Ubuntu', 'sans-serif'], // Preserve your custom font
      },
      colors: {
        primary: "#287094", // Preserve your primary color if needed
        // Add other custom colors if necessary
      },
    },
  },
  darkMode: "class", // Retain dark mode support
  plugins: [nextui()], // Add NextUI plugin
};
