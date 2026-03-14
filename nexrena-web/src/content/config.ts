import { defineCollection, z } from 'astro:content';

const work = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    vertical: z.string(),
    year: z.number(),
    services: z.array(z.string()),
    metrics: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })),
    thumbnail: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    order: z.number(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    author: z.string().default('Nexrena'),
    category: z.enum(['seo', 'web-design', 'ecommerce', 'strategy', 'manufacturing', 'professional-services']).default('strategy'),
  }),
});

export const collections = { work, services, blog };
