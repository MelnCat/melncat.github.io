import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
	loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		z.object({
			slug: z.string(),
			title: z.string(),
			description: z.string(),
			date: z.coerce.date()
		}),
});

export const collections = { posts };
