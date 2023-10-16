# astro-og-canvas

This package provides utlities to generate OpenGraph images for the pages on your Astro site.

## Installation

```shell
npm i astro-og-canvas
```

**Using `pnpm`?** `pnpm` users will also need to install `canvaskit-wasm` as a direct dependency:

```shell
pnpm i canvaskit-wasm
```

## Version compatibility

| astro | astro-og-canvas |
| --- | --- |
| <=`2.x` | [`0.1.x`](https://github.com/delucis/astro-og-canvas/blob/astro-og-canvas%400.1.8/README.md) | 
| >=`3.x` | [`0.2.x`](https://github.com/delucis/astro-og-canvas/blob/astro-og-canvas%400.2.0/README.md) |

## Usage

### Creating an OpenGraph image endpoint

1. Create a new file in your `src/pages/` directory. For example, `src/pages/open-graph/[...route].ts`.

2. Use the `OGImageRoute` helper to create `getStaticPaths` and `GET` functions for you:

   ```ts
   import { OGImageRoute } from 'astro-og-canvas';

   export const { getStaticPaths, GET } = OGImageRoute({
     // Tell us the name of your dynamic route segment.
     // In this case it’s `route`, because the file is named `[...route].ts`.
     param: 'route',

     // A collection of pages to generate images for.
     // This can be any map of paths to data, not necessarily a glob result.
     pages: await import.meta.glob('/src/pages/**/*.md', { eager: true }),

     // For each page, this callback will be used to customize the OpenGraph
     // image. For example, if `pages` was passed a glob like above, you
     // could read values from frontmatter.
     getImageOptions: (path, page) => ({
       title: page.frontmatter.title,
       description: page.frontmatter.description,
       logo: {
         path: './src/astro-docs-logo.png',
       },
       // There are a bunch more options you can use here!
     }),
   });
   ```

### Image Options

Your `getImageOptions` callback should return an object configuring the image to render. Almost all options are optional.

```ts
export interface OGImageOptions {
  /** Page title. */
  title: string;

  /** Short page description. */
  description?: string;

  /** Writing direction. Default: `'ltr'`. Set to `'rtl'` for Arabic, Hebrew, etc. */
  dir?: 'rtl' | 'ltr';

  /** Optional site logo. Displayed at the top of the card. */
  logo?: {
    /** Path to the logo image file, e.g. `'./src/logo.png'` */
    path: string;

    /**
     * Size to display logo at.
     * - `undefined` — Use original image file dimensions. (Default)
     * - `[width]` — Resize to the specified width, height will be
     *               resized proportionally.
     * - `[width, height]` — Resized to the specified width and height.
     */
    size?: [width?: number, height?: number];
  };

  /**
   * Array of `[R, G, B]` colors to use in the background gradient,
   * e.g. `[[255, 0, 0], [0, 0, 255]]` (red to blue).
   * For a solid color, only include a single color, e.g. `[[0, 0, 0]]`
   */
  bgGradient?: RGBColor[];

  /** Border config. Highlights a single edge of the image. */
  border?: {
    /** RGB border color, e.g. `[0, 255, 0]`. */
    color?: RGBColor;

    /** Border width. Default: `0`. */
    width?: number;

    /** Side of the image to draw the border on. Inline start/end respects writing direction. */
    side?: LogicalSide;
  };

  /** Amount of padding between the image edge and text. Default: `60`. */
  padding?: number;

  /** Font styles. */
  font?: {
    /** Font style for the page title. */
    title?: FontConfig;

    /** Font style for the page description. */
    description?: FontConfig;
  };

  /** Array of font URLs to load and use when rendering text. */
  fonts?: string[];
}
```

#### `FontConfig`

```ts
export interface FontConfig {
  /** RGB text color. Default: `[255, 255, 255]` */
  color?: RGBColor;

  /** Font size. Title default is `70`, description default is `40`. */
  size?: number;

  /** Font weight. Make sure you provide a URL for the matching font weight. */
  weight?: Exclude<keyof CanvasKit['FontWeight'], 'values'>;

  /** Line height, a.k.a. leading. */
  lineHeight?: number;

  /**
   * Font families to use to render this text. These must be loaded using the
   * top-level `fonts` config option.
   *
   * Similar to CSS, this operates as a “font stack”. The first family in the
   * list will be preferred with next entries used if a glyph isn’t in earlier
   * families. Useful for providing fallbacks for different alphabets etc.
   *
   * Example: `['Noto Sans', 'Noto Sans Arabic']`
   */
  families?: string[];
}
```

## License

MIT
