/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#136dec",
                "background-dark": "#101822",
                "surface-dark": "#1c2027",
                "surface-input": "#282f39",
                "border-dark": "#3b4554",
                "text-secondary": "#9da8b9",
            },
            fontFamily: {
                "display": ["Lexend", "Noto Sans", "sans-serif"],
                "body": ["Noto Sans", "sans-serif"],
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
