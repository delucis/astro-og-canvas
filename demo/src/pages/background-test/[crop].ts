import { OGImageRoute } from 'astro-og-canvas';

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'crop',
  pages: {
    'crop.md': {
      title: 'Background Image',
      description: 'Test Margin without cropping',
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
    bgImage: { path: './src/bgPattern.png', margin: [100, 100, 100, 100], crop: true },
    padding: 60,
    font: {
      color: "black",
    },
  }),
});
