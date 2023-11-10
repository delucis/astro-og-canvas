import { OGImageRoute } from 'astro-og-canvas';

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'cover',
  pages: {
    'cover.md': {
      title: 'Background Image',
      description: 'Test cropping image according to margin',
    },
  },
  getImageOptions: (_path, page) => ({
    ...page,
    logo: { path: './src/komodo.png', size: [350] },
    border: { color: [100, 100, 100], width: 20, side: 'block-end' },
    bgGradient: [
      [42, 35, 62],
      [23, 20, 36],
    ],
    bgImage: { path: './src/bgPattern.png',margin: [100, 100, 100, 100] },
    padding: 60,
    font: {
      title: {
        color: [0, 0, 0],
      }
    },
  }),

});
