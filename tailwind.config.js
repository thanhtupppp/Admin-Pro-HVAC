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
                // Industrial HVAC Color System
                bg: {
                    base: '#0B1220',
                    panel: '#0F172A',
                    soft: '#111827',
                    hover: '#1E293B'
                },
                text: {
                    primary: '#E5E7EB',
                    secondary: '#9CA3AF',
                    muted: '#6B7280'
                },
                status: {
                    ok: '#22C55E',
                    warn: '#F59E0B',
                    error: '#EF4444',
                    off: '#64748B'
                },
                brand: {
                    primary: '#0EA5E9',
                    accent: '#38BDF8'
                },
                border: {
                    base: '#1E293B',
                    light: '#334155'
                },
                // Legacy colors (keep for compatibility)
                "primary": "#136dec", // Original primary
                "background-dark": "#101822",
                "surface-dark": "#1c2027",
                "surface-input": "#282f39",
                "border-dark": "#3b4554",
                "text-secondary": "#9da8b9",
            },
            fontFamily: {
                "display": ["Lexend", "Noto Sans", "sans-serif"],
                "body": ["Noto Sans", "sans-serif"],
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'pulse-slow': 'pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
