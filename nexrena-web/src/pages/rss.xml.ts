import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://nexrena.com';

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );

  const items = posts
    .map((post) => {
      const url = `${SITE}/resources/blog/${post.slug}`;
      const updatedAt = post.data.updatedAt ?? post.data.publishedAt;
      return `
    <item>
      <title>${escapeXml(post.data.title)}</title>
      <description>${escapeXml(post.data.description)}</description>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${post.data.publishedAt.toUTCString()}</pubDate>
      <atom:updated>${updatedAt.toISOString()}</atom:updated>
    </item>`;
    })
    .join('');

  const body = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nexrena Blog</title>
    <description>B2B web design, SEO, and digital growth insights.</description>
    <link>${SITE}/resources/blog</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
