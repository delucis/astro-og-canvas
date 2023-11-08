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
    ...page,
    border: { color: [100, 100, 100], width: 20, side: 'block-end' },
    bgGradient: [[0, 0, 0]],
    padding: 60,
    font: {
      title: { size: 90, families: ['IBM Plex Mono'], weight: 'Normal' },
      description: { families: ['IBM Plex Mono'] },
    },
    fonts: ['./src/pages/local-font-test/_fonts/ibm-plex-mono-latin-400-normal.ttf'],
  }),
});
