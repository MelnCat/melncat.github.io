// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import mdx from "@astrojs/mdx";

import react from "@astrojs/react";

import svelte from "@astrojs/svelte";

export default defineConfig({
    site: "https://melncat.github.io",

    experimental: {
        fonts: [
            {
                provider: fontProviders.google(),
                name: "Roboto",
                cssVariable: "--font-roboto",
                weights: [400, 700]
            },
            {
                provider: fontProviders.google(),
                name: "Cascadia Code",
                cssVariable: "--font-cascadia-code"
            },
            {
                provider: fontProviders.google(),
                name: "Fira Code",
                cssVariable: "--font-fira-code",
                weights: [400, 700]
            },
        ],
    },

    integrations: [mdx(), react(), svelte()],
});