import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const guideSchema = z.object({
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
    mapName: z.string().optional(),
    mapUrl: z.string().url().optional(),
    image: z
      .enum([
        "hero",
        "bridgeSide",
        "ironBridge",
        "shengxing",
        "oldLine",
        "bridgeBody",
        "bridgeRear",
        "bridgeMorning",
        "stationTunnel",
        "woodcarving",
        "historicBridge",
        "reservoir",
        "huoyanshanTrail",
        "woodMuseum",
        "taianOldStation",
        "oldLineRailbike",
        "shengxingFood",
      ])
      .default("hero"),
  });

const guides = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guides" }),
  schema: guideSchema,
});

const guidesEn = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guides-en" }),
  schema: guideSchema,
});

export const collections = { guides, guidesEn };
