// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import path from 'path';
import { fileURLToPath } from 'url';

import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  trailingSlash: 'always',
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) =>
        !/\/resources\/blog\/\d+\/$/.test(page) &&
        !/\/resources\/blog\/category\//.test(page),
      // Split sitemaps by site section (mutually exclusive URL checks).
      // Remaining URLs (home, about, contact, work, etc.) go to sitemap-pages-0.xml.
      chunks: {
        services: (item) => {
          if (/\/services\//.test(item.url)) return item;
        },
        industries: (item) => {
          if (/\/industries\//.test(item.url)) return item;
        },
        'resources-blog': (item) => {
          if (/\/resources\/blog\//.test(item.url)) return item;
        },
        'resources-other': (item) => {
          if (/\/resources\//.test(item.url) && !/\/resources\/blog\//.test(item.url)) {
            return item;
          }
        },
      },
    }),
  ],
  site: 'https://nexrena.com',

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
  },
});