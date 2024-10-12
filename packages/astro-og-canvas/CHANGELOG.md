# astro-og-canvas

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
