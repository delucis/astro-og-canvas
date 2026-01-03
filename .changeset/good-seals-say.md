---
'astro-og-canvas': minor
---

Makes `OGImageRoute()` asynchronous.

⚠️ **BREAKING CHANGE:** You must now `await` the result of `OGImageRoute()`:

```diff
import { OGImageRoute } from 'astro-og-canvas';

- export const { getStaticPaths, GET } = OGImageRoute({
+ export const { getStaticPaths, GET } = await OGImageRoute({
```
