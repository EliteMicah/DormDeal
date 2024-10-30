/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        times: ["Times New Roman, Times, serif"],
        impact: ["Impact, Haettenschweiler, Arial Narrow Bold, sans-serif"],
      },
      colors: {
        "header-grey": "#222020",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-mytheme":
          "linear-gradient(to bottom, rgb(14, 20, 25), rgb(41, 41, 41))",
      },
      margin: {
        "9p": "9%",
      },
      padding: {
        75: "75px",
        100: "100px",
        200: "200px",
      },
    },
    spacing: {
      1: "8px",
      2: "12px",
      3: "16px",
      4: "24px",
      5: "32px",
      6: "48px",
      7: "60px",
      75: "75px",
      200: "200px",
      300: "300px",
      400: "400px",
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
  darkMode: "class",
};
