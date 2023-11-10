import { OGImageRoute } from 'astro-og-canvas';

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'cropNcover',
  pages: {
    'cropNcover.md': {
      title: '',
      description: '',
    },
  },
  getImageOptions: (_path, page) => ({
    ...page,
    logo: { path: './src/komodo.png', size: [350] },
    bgGradient: [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
    ],
    bgImage: { path: './src/bgPattern.png', margin: [100, 50, 0, 50], crop: true, size:"cover" },
  }),
});
