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
                'gruen': {
                    DEFAULT: '#00876c',
                    100: '#001b15',
                    200: '#00352a',
                    300: '#005040',
                    400: '#006a55',
                    500: '#00876c',
                    600: '#00d0a6',
                    700: '#1dffd2',
                    800: '#68ffe1',
                    900: '#b4fff0'
                },
                'blau': {
                    DEFAULT: '#4664aa',
                    100: '#0e1422',
                    200: '#1c2844',
                    300: '#2a3c66',
                    400: '#385088',
                    500: '#4664aa',
                    600: '#6581c0',
                    700: '#8ca0d0',
                    800: '#b2c0e0',
                    900: '#d9dfef'
                },
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
                'maigruen': {
                    DEFAULT: '#77a200',
                    100: '#182100',
                    200: '#304100',
                    300: '#486200',
                    400: '#608300',
                    500: '#77a200',
                    600: '#abe900',
                    700: '#c8ff2f',
                    800: '#daff74',
                    900: '#edffba'
                },
                'lila': {
                    DEFAULT: '#a3107c',
                    100: '#200319',
                    200: '#410631',
                    300: '#610a4a',
                    400: '#820d63',
                    500: '#a3107c',
                    600: '#df16a9',
                    700: '#ed4ac2',
                    800: '#f386d6',
                    900: '#f9c3eb'
                },
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
        },
    },
    plugins: [],
} satisfies Config;
