import { OGImageRoute } from 'astro-og-canvas';

const logoPath = './src/astro-docs-logo.png';
const bgPath = './src/bgPattern.png';

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'path',
  pages: {
    'contain.md': {
      bgImage: { path: bgPath, fit: 'contain' },
      title: 'bgImage: { fit: "contain" }',
    },
    'cover.md': {
      bgImage: { path: bgPath, fit: 'cover' },
      title: 'bgImage: { fit: "cover" }',
    },
    'fill.md': {
      bgImage: { path: bgPath, fit: 'fill' },
      title: 'bgImage: { fit: "fill" }',
    },
    'default.md': {
      bgImage: { path: bgPath, fit: 'none' },
      title: 'bgImage: { fit: "none" }',
    },
    'logo-contain.md': {
      bgImage: { path: logoPath, fit: 'contain' },
      title: 'bgImage: { fit: "contain" }',
      font: { title: { color: [0, 0, 0], weight: 'Bold' } },
    },
    'logo-cover.md': {
      bgImage: { path: logoPath, fit: 'cover' },
      title: 'bgImage: { fit: "cover" }',
      font: { title: { color: [0, 0, 0], weight: 'Bold' } },
    },
    'logo-fill.md': {
      bgImage: { path: logoPath, fit: 'fill' },
      title: 'bgImage: { fit: "fill" }',
      font: { title: { color: [0, 0, 0], weight: 'Bold' } },
    },
    'logo-default.md': {
      bgImage: { path: logoPath, fit: 'none' },
      title: 'bgImage: { fit: "none" }',
      font: { title: { color: [0, 0, 0], weight: 'Bold' } },
    },
    'logo-start.md': {
      bgImage: { path: logoPath, position: 'start' },
      title: 'bgImage: { position: "start" }',
      font: { title: { color: [0, 0, 0], weight: 'Bold' } },
    },
    'logo-end.md': {
      bgImage: { path: logoPath, position: 'end' },
      title: 'bgImage: { position: "end" }',
      font: { title: { color: [0, 0, 0], weight: 'Bold' } },
    },
    'logo-center-end.md': {
      bgImage: { path: logoPath, position: ['center', 'end'] },
      title: 'bgImage: {\n  position: ["center", "end"],\n}',
      font: { title: { color: [0, 0, 0], weight: 'Bold' } },
    },
    'logo-end-center.md': {
      bgImage: { path: logoPath, position: ['end', 'center'] },
      title: 'bgImage: {\n  position: ["end", "center"],\n}',
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
