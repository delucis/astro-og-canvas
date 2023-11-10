import { OGImageRoute } from 'astro-og-canvas';

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'margin',
  pages: {
    'margin.md': {
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
    bgImage: { path: './src/bgPattern.png', margin: [200, 200, 200, 200], crop: false },
  }),
});
