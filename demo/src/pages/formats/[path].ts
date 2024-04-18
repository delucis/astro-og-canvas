import { OGImageRoute } from 'astro-og-canvas';

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'path',
  pages: {
    'png.md': {
      title: 'Test image (PNG)',
      description: 'Renders an Open Graph image to a PNG file',
      format: 'PNG',
    },
    'jpeg.md': {
      title: 'Test image (JPEG)',
      description: 'Renders an Open Graph image to a JPEG file',
      format: 'JPEG',
    },
    'webp.md': {
      title: 'Test image (WEBP)',
      description: 'Renders an Open Graph image to a WEBP file',
      format: 'WEBP',
    },
  },
  getSlug(path, { format }) {
    const ext = format.toLowerCase();
    path = path.replace(/^\/src\/pages\//, '');
    path = path.replace(/\.[^.]*$/, '') + '.' + ext;
    return path;
  },
  getImageOptions: (_path, page) => ({
    ...page,
  }),
});
