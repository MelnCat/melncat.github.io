// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import mdx from "@astrojs/mdx";

export default defineConfig({
	site: "https://melncat.github.io",

	experimental: {
		fonts: [
			{
				provider: fontProviders.google(),
				name: "Roboto",
				cssVariable: "--font-roboto",
			},
			{
				provider: fontProviders.google(),
				name: "Cascadia Code",
				cssVariable: "--font-cascadia-code"
			},
		],
	},

	integrations: [mdx()],
});
