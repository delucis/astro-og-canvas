# astro-og-canvas

## 0.12.0

### Minor Changes

- [#186](https://github.com/delucis/astro-og-canvas/pull/186) [`22ac557`](https://github.com/delucis/astro-og-canvas/commit/22ac557dbe6b088b4b7d112eea10bcd14667102a) Thanks [@michaelfaith](https://github.com/michaelfaith)! - Added support for Astro 7.

## 0.11.1

### Patch Changes

- [#163](https://github.com/delucis/astro-og-canvas/pull/163) [`390fdea`](https://github.com/delucis/astro-og-canvas/commit/390fdeaf1ad7f9e720a6753777355de7596d297a) Thanks [@renovate](https://github.com/apps/renovate)! - Updates dependency canvaskit-wasm to ^0.41.1

## 0.11.0

### Minor Changes

- [#157](https://github.com/delucis/astro-og-canvas/pull/157) [`91ac061`](https://github.com/delucis/astro-og-canvas/commit/91ac06176a60618b5e2b53df9a462de0bd42f595) Thanks [@renovate](https://github.com/apps/renovate)! - Updates dependency `entities` to v8

  ⚠️ **Potentially breaking change:** The minimum supported Node version is now 20.19.0

### Patch Changes

- [#155](https://github.com/delucis/astro-og-canvas/pull/155) [`1066126`](https://github.com/delucis/astro-og-canvas/commit/1066126c60e613693618a257b81471eb51af6369) Thanks [@renovate](https://github.com/apps/renovate)! - Updates dependency `canvaskit-wasm` to ^0.41.0

## 0.10.1

### Patch Changes

- [#128](https://github.com/delucis/astro-og-canvas/pull/128) [`dd829f9`](https://github.com/delucis/astro-og-canvas/commit/dd829f9afaa439e5949f6d0e207a0af07e0777fc) Thanks [@renovate](https://github.com/apps/renovate)! - Updates dependency entities to ^7.0.1

## 0.10.0

### Minor Changes

- [#119](https://github.com/delucis/astro-og-canvas/pull/119) [`151edd2`](https://github.com/delucis/astro-og-canvas/commit/151edd223d3374d1a13b5e09a604e17c2c24c6d8) Thanks [@delucis](https://github.com/delucis)! - Makes `OGImageRoute()` asynchronous.

  ⚠️ **BREAKING CHANGE:** You must now `await` the result of `OGImageRoute()`:

  ```diff
  import { OGImageRoute } from 'astro-og-canvas';

  - export const { getStaticPaths, GET } = OGImageRoute({
  + export const { getStaticPaths, GET } = await OGImageRoute({
  ```

### Patch Changes

- [#119](https://github.com/delucis/astro-og-canvas/pull/119) [`151edd2`](https://github.com/delucis/astro-og-canvas/commit/151edd223d3374d1a13b5e09a604e17c2c24c6d8) Thanks [@delucis](https://github.com/delucis)! - Fixes using the built-in `getSlug()` for OG images with `format: "JPEG"` or `format: "WEBP"`

## 0.9.0

### Minor Changes

- [#117](https://github.com/delucis/astro-og-canvas/pull/117) [`b94a123`](https://github.com/delucis/astro-og-canvas/commit/b94a12315af9db9f63e44dc7d7fece4161cead50) Thanks [@delucis](https://github.com/delucis)! - Adds type safety to `OGImageRoute`. The `page` parameter in `getSlug()` and `getImageOptions()` is now correctly inferred from the value passed to `pages` instead of being typed as `any`.

  ```js
  OGImageRoute({
    pages: {
      example: {
        title: 'Example Page',
        description: 'Description of this page shown in smaller text',
      },
    },
    getImageOptions: (path, page) => {
      page;
      // ^? { title: string; description: string }
    },
  });
  ```

  ⚠️ **Potentially breaking change:** If you are type checking your code base, you may see type errors if you are accessing `page` in `getSlug()` or `getImageOptions()` in a non-type-safe way and will need to either update that code or add some additional types.

- [#117](https://github.com/delucis/astro-og-canvas/pull/117) [`b94a123`](https://github.com/delucis/astro-og-canvas/commit/b94a12315af9db9f63e44dc7d7fece4161cead50) Thanks [@delucis](https://github.com/delucis)! - Exports `OGImageOptions` type

## 0.8.0

### Minor Changes

- [#114](https://github.com/delucis/astro-og-canvas/pull/114) [`a9f9fd2`](https://github.com/delucis/astro-og-canvas/commit/a9f9fd234e799a49f59ed4fa3def1c490f7c8066) Thanks [@delucis](https://github.com/delucis)! - Drops official support for Astro 3 and 4. Use Astro 5 instead.

### Patch Changes

- [#114](https://github.com/delucis/astro-og-canvas/pull/114) [`a9f9fd2`](https://github.com/delucis/astro-og-canvas/commit/a9f9fd234e799a49f59ed4fa3def1c490f7c8066) Thanks [@delucis](https://github.com/delucis)! - Adds experimental support for Astro 6

- [#109](https://github.com/delucis/astro-og-canvas/pull/109) [`975f8ac`](https://github.com/delucis/astro-og-canvas/commit/975f8ac932bbd35cc731334e8d3f03357a08633e) Thanks [@delucis](https://github.com/delucis)! - Refactors internals

## 0.7.2

### Patch Changes

- [#100](https://github.com/delucis/astro-og-canvas/pull/100) [`a5f25e2`](https://github.com/delucis/astro-og-canvas/commit/a5f25e2667d42a89afc5503be9b82d8626c2bf52) Thanks [@delucis](https://github.com/delucis)! - This package is now published using OIDC trusted publishing and provenance guarantees

- [#99](https://github.com/delucis/astro-og-canvas/pull/99) [`6fc6258`](https://github.com/delucis/astro-og-canvas/commit/6fc62589cac2b1d4067e7730f4afb981d79c0ac8) Thanks [@delucis](https://github.com/delucis)! - Updates `entities` and `canvaskit-wasm` internal dependencies

## 0.7.1

### Patch Changes

- e8bb055: Improves handling of cases where OG images are requested to be generated in parallel

## 0.7.0

### Minor Changes

- 5dcccb4: Reverts v0.6.0 changes. NPM was failing to pack bundled dependencies as expected, so this release reverts things to the v0.5.x state until we have time to figure this out.

## 0.6.0

### Minor Changes

- 330c56c: Bundles `canvaskit-wasm` to avoid users with strict package managers like PNPM needing to install it directly

## 0.5.6

### Patch Changes

- bb13312: Fixes a README code example

## 0.5.5

### Patch Changes

- ceeecc1: Expands peer dependencies to support Astro v5

## 0.5.4

### Patch Changes

- 252e840: Adds an explicit `Buffer` import for Deno compatibility

## 0.5.3

### Patch Changes

- 0bea94b: Refactors CanvasKit initialization to log more helpful error in PNPM projects without `canvaskit-wasm` installed

## 0.5.2

### Patch Changes

- 9fec927: Fixes image generation for slugs with a leading slash in Astro ≥4.10.2

## 0.5.1

### Patch Changes

- c7d3a7a: Improves README

## 0.5.0

### Minor Changes

- e66e580: Switches to using the “full” `canvaskit-wasm` build to generate images. This fixes support for rendering as JPEG or WEBP instead of the default PNG.
- e66e580: Updates `canvaskit-wasm` to the latest release

  **Note:** pnpm users may need to manually update in their project too:

  ```sh
  pnpm i canvaskit-wasm@^0.39.1
  ```

## 0.4.2

### Patch Changes

- be0c969: Adds missing comma in README

## 0.4.1

### Patch Changes

- 0cbcfa3: Support Astro v4

## 0.4.0

### Minor Changes

- c9b3dc9: Adds support for rendering a background image

## 0.3.2

### Patch Changes

- 8416369: Update `deterministic-object-hash` from 1.3.1 to 2.0.2

## 0.3.1

### Patch Changes

- 6432706: Update README docs

## 0.3.0

### Minor Changes

- 1b83057: Add support for loading local font files
- 19f025a: Cache images across builds

## 0.2.1

### Patch Changes

- 467523f: Add note about `canvaskit-wasm` for pnpm users to README

## 0.2.0

### Minor Changes

- 2f8952c: Add support for Astro 3.0 and remove support for Astro 1.0 and 2.0.

  When upgrading, update your OpenGraph routes to use `GET` instead instead of lowercase `get`:

  ```diff
  import { OGImageRoute } from 'astro-og-canvas';

  - export const { getStaticPaths, get } = OGImageRoute({
  + export const { getStaticPaths, GET } = OGImageRoute({
    // ...
  });
  ```

## 0.1.8

### Patch Changes

- a598023: Fix unexpected slug truncation for paths without extension
- ed36da8: Bump dev dependencies

## 0.1.7

### Patch Changes

- 8c10732: Manually free memory after generating an image

## 0.1.6

### Patch Changes

- c063c32: Allow installation in Astro v2 projects

## 0.1.5

### Patch Changes

- 98be213: Handle index files in default slugifier (e.g. `/foo/index.md` now becomes `/foo.png` instead of `/foo/index.png`)

## 0.1.4

### Patch Changes

- cadcdb5: Improve layout logic to better handle long text

## 0.1.3

### Patch Changes

- 819977a: Support HTML entities in title & description
- be5c57f: Remove unused array in font manager
- cd14cbe: Fix bug causing font manager to return previous manager instance

## 0.1.2

### Patch Changes

- 641bbe9: Fix debug logging prefix
- 479a011: Ship compiled JavaScript output instead of uncompiled TypeScript.
- 7fd6d5b: Support async `getImageOptions`

## 0.1.1

### Patch Changes

- 373b227: Work around memory leak by avoiding reinstantiations of `CanvasKit.FontMgr`
- e8f3952: Avoid top-level `await` for better support in different environments

## 0.1.0

### Minor Changes

- 6c99108: Initial release
