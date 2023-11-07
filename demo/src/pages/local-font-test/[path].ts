import { OGImageRoute } from 'astro-og-canvas';

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'path',
  pages: {
    'local.md': {
      title: 'Local fonts',
      description: 'Loads IBM Plex Mono from a local font file',
    },
  },
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    dir: page.dir,
    logo: { path: './src/astro-docs-logo.png', size: [400] },
    border: { color: [255, 93, 1], width: 20, side: 'inline-start' },
    bgGradient: [
      [42, 35, 62],
      [23, 20, 36],
    ],
    padding: 60,
    font: {
      title: {
        size: 78,
        families: ['IBM Plex Mono'],
        weight: 'Normal',
      },
      description: {
        size: 45,
        lineHeight: 1.25,
        families: ['IBM Plex Mono'],
        weight: 'Normal',
      },
    },
    fonts: ['./src/pages/local-font-test/_fonts/ibm-plex-mono-latin-400-normal.ttf'],
  }),
});
