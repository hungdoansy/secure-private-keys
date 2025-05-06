import type { Config } from "tailwindcss"

const config: Config = {
    darkMode: ["class"],
    content: ["./src/**/*.{ts,tsx}"],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
        },
        extend: {
            colors: {
                background: "hsl(var(--background) / <alpha-value>)",
                foreground: "hsl(var(--foreground) / <alpha-value>)",
                accent: {
                    DEFAULT: "hsl(var(--accent) / <alpha-value>)",
                    foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
                    foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
                },
                border: "hsl(var(--border) / <alpha-value>)",
            },
            borderWidth: {
                "3": "3px",
            },
            spacing: {
                "7.5": "1.875rem",
                "15": "3.75rem",
                "18": "4.5rem",
            },
            size: {
                "7.5": "1.875rem",
                "15": "3.75rem",
                "18": "4.5rem",
            },
        },
    },
}

export default config
