// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,css}"],
  theme: {
    extend: {
      screens: {
        sm: "500px",
      },
      colors: {
        "gunmetal-blue": "#2C363F",
        "airforce-blue": "#508AA8",
        "prussian-blue": "#1C3144",
        "princeton-orange": "#45CDCD", // this color is the same as the blue-mainpagebeforeLogin because I was too lazy to switch all the bg colors used in the project and I was just changing this color
        "floral-white": "#FFFCF2",
        "gunmetal-brighterblue": "#454F58",
        "honeydew-good": "#F0FFF0",
        "peach-puff": "#FFDAB9",
        "lavender-blush": "#FFF0F5",
        "light-goldenrod-yellow": "#FAFAD2",
        "electric-lime": "#CCFF00",
        "lemon-chiffon": "#FFFACD",
        "mango-tango": "#FF8243",
        "coral-good": "#FF7F50",
        "black-green": "#00A96E",
        "blue-mainpagebeforeLogin": "#45CDCD",
        kindofwhite: "#E8F0FD",
      },
      fontFamily: {
        kodchasan: ["Kodchasan", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        openSans: ["Open Sans", "sans-serif"],
        lato: ["Lato", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
        raleway: ["Raleway", "sans-serif"],
        ubuntu: ["Ubuntu", "sans-serif"],
        quicksand: ["Quicksand", "sans-serif"],
        merriweather: ["Merriweather", "serif"],
      },
      backgroundImage: {
        "deep-ocean-gradient":
          "linear-gradient(to right, #2C363F, #508AA8, #1C3144)",
        "sunset-blaze-gradient":
          "linear-gradient(to right, #FE9000, #508AA8, #1C3144)",
        "twilight-hues-gradient":
          "linear-gradient(to right, #FFFCF2, #508AA8, #2C363F)",
        "prussian-blue": "linear-gradient(to right, #1C3144, #45CDCD)",
        "gunmetal-floral": "linear-gradient(to bottom, #2C363F, #FFFCF2)",
        "airforce-princeton": "linear-gradient(to left, #508AA8, #45CDCD)",
        "prussian-floral": "linear-gradient(to top, #1C3144, #FFFCF2)",
        "gunmetal-airforce": "linear-gradient(135deg, #2C363F, #508AA8)",
      },
      boxShadow: {
        border: "0 0 0 2px rgba(0, 0, 0, 0.1)",
      },
      keyframes: {
        ripple: {
          "0%": { opacity: "0", transform: "scale(0.5)" }, // Start at half size
          "25%": { opacity: "0.3", transform: "scale(0.75)" },
          "50%": { opacity: "0.6", transform: "scale(1)" }, // Reach full size sooner
          "100%": { opacity: "0", transform: "scale(1.5)" },
        },
        flicker: {
          "0%": { opacity: 1 },
          "50%": { opacity: 0.5 },
          "100%": { opacity: 1 },
        },
      },
      animation: {
        ripple: "ripple 4s linear infinite",
        flicker: "flicker 2s infinite",
      },
      width: {
        "1/2": "60%",
        "9/10": "90%",
        "7/10": "70%",
        "5/10": "50%",
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["hover"],
      textColor: ["hover"],
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#0000ff",
          secondary: "#ff0000",
          "--acc": "#00ff00",
          neutral: "#3d4451",
          "base-100": "#808080",
        },
      },
      "dark",
    ],
  },
};
