import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const guides = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guides" }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string(),
    description: z.string(),
    slug: z.string(),
    eyebrow: z.string(),
    intro: z.string(),
    readTime: z.string(),
    facts: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
    ),
    highlights: z.array(
      z.object({
        title: z.string(),
        text: z.string(),
      }),
    ),
    mapQuery: z.string().optional(),
    image: z
      .enum(["hero", "bridgeSide", "ironBridge", "shengxing", "oldLine"])
      .default("hero"),
  }),
});

export const collections = { guides };
