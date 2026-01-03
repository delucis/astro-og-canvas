import type { MarkdownInstance } from 'astro';
import { OGImageRoute } from 'astro-og-canvas';

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages: import.meta.glob<MarkdownInstance<{ title?: string; description?: string }>>(
    '/src/pages/**/*.md',
    { eager: true }
  ),
  getImageOptions: (_path, page) => ({
    title: page.frontmatter.title,
    description: page.frontmatter.description,
    logo: { path: './src/astro-docs-logo.png', size: [350] },
    border: { width: 10 },
    padding: 40,
  }),
});
