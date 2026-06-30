---
'astro-og-canvas': minor
---

Adds auto-detection for the route parameter name to `OGImageRoute()`.

**⚠️ BREAKING CHANGE:** The `param` option to `OGImageRoute()` has been removed and your code should be updated to remove it:

```diff
export const { getStaticPaths, GET } = await OGImageRoute({
- param: 'slug',
  pages: {
    // ...
  },
  getImageOptions: () => {/* ... */},
});
```

`astro-og-canvas` now detects the `param` value from your image endpoint’s filename automatically.
