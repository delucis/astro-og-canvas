import { OGImageRoute } from 'astro-og-canvas';

const logoPath = './src/komodo.png';
const bgPath = './src/bgPattern.png';

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'path',
  pages: {
    'contain.md': {
      bgImage: { path: bgPath, size: 'contain' },
      title: '{ size: "contain" }',
    },
    'cover.md': {
      bgImage: { path: bgPath, size: 'cover' },
      title: '{ size: "cover" }',
    },
    'crop.md': {
      bgImage: { path: bgPath, margin: [100, 50, 0, 50], crop: true },
      title: '{\n  margin: [100, 50, 0, 50],\n  crop: true,\n}',
    },
    'cropNcover.md': {
      bgImage: { path: bgPath, margin: [100, 50, 0, 50], crop: true, size: 'cover' },
      title: '{\n  margin: [100, 50, 0, 50],\n  crop: true,\n  size: "cover",\n}',
    },
    'default.md': {
      bgImage: { path: bgPath },
      title: '{}',
    },
    'margin.md': {
      bgImage: { path: bgPath, margin: [200, 200, 200, 200], crop: false },
      title: '{\n  margin: [200, 200, 200, 200],\n  crop: false,\n}',
      font: { title: { color: [0, 0, 0], weight: 'Bold' } },
    },
  },
  getImageOptions: (_path, page) => ({
    title: '',
    description: '',
    logo: { path: logoPath, size: [350] },
    bgGradient: [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
    ],
    font: { title: { color: [0, 255, 0], weight: 'Bold' } },
    ...page,
  }),
});
