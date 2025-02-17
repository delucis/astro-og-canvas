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

| astro  | astro-og-canvas                                                                               |
| ------ | --------------------------------------------------------------------------------------------- |
| `≤2.x` | [`0.1.x`](https://github.com/delucis/astro-og-canvas/blob/astro-og-canvas%400.1.8/README.md)  |
| `≥3.x` | [`≥0.2.x`](https://github.com/delucis/astro-og-canvas/blob/astro-og-canvas%400.2.0/README.md) |

## Usage

### Creating an OpenGraph image endpoint

1. Create a new file in your `src/pages/` directory. For example, `src/pages/open-graph/[...route].ts`.

2. Use the `OGImageRoute` helper to create `getStaticPaths` and `GET` functions for you:

   ```js
   // src/pages/open-graph/[...route].ts

   import { OGImageRoute } from 'astro-og-canvas';

   export const { getStaticPaths, GET } = OGImageRoute({
     // Tell us the name of your dynamic route segment.
     // In this case it’s `route`, because the file is named `[...route].ts`.
     param: 'route',

     // A collection of pages to generate images for.
     // The keys of this object are used to generate the path for that image.
     // In this example, we generate one image at `/open-graph/example.png`.
     pages: {
      'example': {
        title: 'Example Page',
        description: 'Description of this page shown in smaller text',
      }
     },

     // For each page, this callback will be used to customize the OpenGraph image.
     getImageOptions: (path, page) => ({
       title: page.title,
       description: page.description,
       logo: {
         path: './src/astro-docs-logo.png',
       },
       // There are a bunch more options you can use here!
     }),
   });
   ```

#### Generating `pages` from a content collection

If you want to generate images for every file in a content collection, use `getCollection()` to load your content entries and convert the entries array to an object.

The following example assumes a content collection schema with `title` and `description` keys in the frontmatter.

```js
import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const collectionEntries = await getCollection('my-collection');

// Map the array of content collection entries to create an object.
// Converts [{ id: 'post.md', data: { title: 'Example', description: '' } }]
// to { 'post.md': { title: 'Example', description: '' } }
const pages = Object.fromEntries(collectionEntries.map(({ slug, data }) => [slug, data]));

export const { getStaticPaths, GET } = OGImageRoute({
  // Tell us the name of your dynamic route segment.
  // In this case it’s `route`, because the file is named `[...route].ts`.
  param: 'route',

  pages: pages,

  getImageOptions: (path, page) => ({
    title: page.title,
    description: page.description,
  }),
});
```

#### Generating `pages` from Markdown files

If you have a folder of Markdown files with `title` and `description` fields in their frontmatter, use `import.meta.glob()` to load and pass these to the `pages` option of `OGImageRoute`.

In the following example, every Markdown file in the project’s `src/pages/` directory is loaded and will have an image generated for them:

```js
import { OGImageRoute } from 'astro-og-canvas';

export const { getStaticPaths, GET } = OGImageRoute({
  // Tell us the name of your dynamic route segment.
  // In this case it’s `route`, because the file is named `[...route].ts`.
  param: 'route',

  // Pass the glob result to pages
  pages: await import.meta.glob('/src/pages/**/*.md', { eager: true }),

  // Extract `title` and `description` from the glob result’s `frontmatter` property
  getImageOptions: (path, page) => ({
    title: page.frontmatter.title,
    description: page.frontmatter.description,
  }),

  // ...
});
```

#### Generating `pages` from other data sources

`pages` can be any object you want. Its keys are used to generate the final route, but other than this, how you use it is up to you, so you can generate images from any data you like.

<details>
<summary>Pokémon API example</summary>

The following example fetches some data about Pokémon using the [PokéAPI](https://pokeapi.co/) and then uses that to generate images:

```js
import { OGImageRoute } from 'astro-og-canvas';

// Fetch first 20 Pokémon from the PokéAPI.
const { results } = await fetch('https://pokeapi.co/api/v2/pokemon/').then((res) => res.json());
// Fetch details for each Pokémon.
const pokemon = {};
for (const { url } of results) {
  const details = await fetch(url).then((res) => res.json());
  pokemon[details.name] = details;
}

export const { getStaticPaths, GET } = OGImageRoute({
  pages: pokemon,

  getImageOptions: (path, page) => ({
    title: page.name,
    description: `Pokémon #${page.order}`,
  }),
});
```

</details>

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

  /** Optional background image. */
  bgImage?: {
    /** Path to the background image file, e.g. `'./src/background.png'`. */
    path: string;

    /** How the background image should resize to fit the container. (Default: `'none'`) */
    fit?: 'cover' | 'contain' | 'none' | 'fill';

    /**
     * How the background image should be positioned in the container. (Default: `'center'`)
     *
     * The value is either a shorthand for both block and inline directions, e.g. `'center'`,
     * or a tuple of `[blockPosition, inlinePosition]`, e.g. `['end', 'center']`.
     */
    position?: LogicalPosition | [LogicalPosition, LogicalPosition];
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

  /**
   * Array of font URLs or file paths to load and use when rendering text,
   * e.g. `['./src/fonts/local-font.ttf', 'https://example.com/cdn/remote-font.ttf']`
   * Local font paths are specified relative to your project’s root.
   */
  fonts?: string[];

  /**
   * Directory to cache images in across builds.
   * Default: `./node_modules/.astro-og-canvas`
   * Set to `false` to disable caching.
   */
  cacheDir?: string | false;
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
