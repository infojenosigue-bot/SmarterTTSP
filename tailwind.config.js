/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0f172a', // Slate 900
                    light: '#334155',
                    dark: '#020617',
                },
                accent: {
                    blue: '#3b82f6', // Blue 500
                    purple: '#a855f7', // Purple 500
                    cyan: '#06b6d4', // Cyan 500
                },
                surface: {
                    DEFAULT: '#ffffff',
                    dark: '#1e293b',
                }
            },
            fontFamily: {
                sans: ['"Segoe UI"', '"Segoe UI Variable"', '"Segoe UI Emoji"', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
            }
        },
    },
    plugins: [],
}
