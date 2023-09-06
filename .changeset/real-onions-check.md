---
'astro-og-canvas': minor
---

Add support for Astro 3.0 and remove support for Astro 1.0 and 2.0.

When upgrading, update your OpenGraph routes to use `GET` instead instead of lowercase `get`:

```diff
import { OGImageRoute } from 'astro-og-canvas';

- export const { getStaticPaths, get } = OGImageRoute({
+ export const { getStaticPaths, GET } = OGImageRoute({
  // ...
});
```
