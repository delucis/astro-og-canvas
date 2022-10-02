import { OGImageRoute } from 'astro-og-canvas';
import { pages } from './_pages';

export const { getStaticPaths, get } = OGImageRoute({
  param: 'path',
  pages,
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
        families: [
          'Work Sans',
          'Noto Sans Black',
          'Noto Sans Arabic',
          'Noto Sans SC Black',
          'Noto Sans TC Black',
          'Noto Sans JP Black',
        ],
        weight: 'ExtraBold',
      },
      description: {
        size: 45,
        lineHeight: 1.25,
        families: [
          'Work Sans',
          'Noto Sans',
          'Noto Sans Arabic',
          'Noto Sans SC',
          'Noto Sans TC',
          'Noto Sans JP',
        ],
        weight: 'Normal',
      },
    },
    fonts: [
      'https://api.fontsource.org/v1/fonts/work-sans/latin-400-normal.ttf',
      'https://api.fontsource.org/v1/fonts/work-sans/latin-800-normal.ttf',

      'https://api.fontsource.org/v1/fonts/noto-sans/cyrillic-400-normal.ttf',
      'https://api.fontsource.org/v1/fonts/noto-sans/cyrillic-900-normal.ttf',

      'https://api.fontsource.org/v1/fonts/noto-sans-sc/chinese-simplified-400-normal.ttf',
      'https://api.fontsource.org/v1/fonts/noto-sans-sc/chinese-simplified-900-normal.ttf',

      'https://api.fontsource.org/v1/fonts/noto-sans-tc/chinese-traditional-400-normal.ttf',
      'https://api.fontsource.org/v1/fonts/noto-sans-tc/chinese-traditional-900-normal.ttf',

      'https://api.fontsource.org/v1/fonts/noto-sans-jp/japanese-400-normal.ttf',
      'https://api.fontsource.org/v1/fonts/noto-sans-jp/japanese-900-normal.ttf',

      'https://api.fontsource.org/v1/fonts/noto-sans-arabic/arabic-400-normal.ttf',
      'https://api.fontsource.org/v1/fonts/noto-sans-arabic/arabic-800-normal.ttf',
    ],
  }),
});
