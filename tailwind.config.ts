import type {Config} from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // add your custom color palette here
                'black': {
                    DEFAULT: '#000000',
                    100: '#000000',
                    200: '#000000',
                    300: '#000000',
                    400: '#000000',
                    500: '#000000',
                    600: '#333333',
                    700: '#666666',
                    800: '#999999',
                    900: '#cccccc'
                },
                'powder_blue': {
                    DEFAULT: '#b0c2ce',
                    100: '#1d282f',
                    200: '#3b505e',
                    300: '#58788d',
                    400: '#829eb0',
                    500: '#b0c2ce',
                    600: '#c0ced8',
                    700: '#d0dbe2',
                    800: '#e0e7eb',
                    900: '#eff3f5'
                },
                'jordy_blue': {
                    DEFAULT: '#90bde1',
                    100: '#10273a',
                    200: '#204e73',
                    300: '#2f74ad',
                    400: '#5599d1',
                    500: '#90bde1',
                    600: '#a5c9e6',
                    700: '#bcd7ed',
                    800: '#d2e4f3',
                    900: '#e9f2f9'
                },
                'cerulean': {
                    DEFAULT: '#367895',
                    100: '#0b181e',
                    200: '#16303c',
                    300: '#20495a',
                    400: '#2b6178',
                    500: '#367895',
                    600: '#4b9cbe',
                    700: '#78b4ce',
                    800: '#a5cddf',
                    900: '#d2e6ef'
                },
                'dark_magenta': {
                    DEFAULT: '#820b8a',
                    100: '#1a021b',
                    200: '#330437',
                    300: '#4d0752',
                    400: '#67096d',
                    500: '#820b8a',
                    600: '#bf11cc',
                    700: '#e236ef',
                    800: '#ec79f4',
                    900: '#f5bcfa'
                },
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
        },
    },
    plugins: [],
} satisfies Config;
