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
  integrations: [react(), mdx(), sitemap()],
  site: 'https://nexrena.com',

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
  },
});