import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "var(--primary)",
                "primary-hover": "var(--primary-hover)",
                "primary-light": "var(--primary-light)",
                accent: "var(--accent)",
                earth: "var(--earth)",
                success: "var(--success)",
                warning: "var(--warning)",
                danger: "var(--danger)",
            },
            fontFamily: {
                sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
            },
        },
    },
    plugins: [],
};

export default config;
