---
'astro-og-canvas': minor
---

Adds type safety to `OGImageRoute`. The `page` parameter in `getSlug()` and `getImageOptions()` is now correctly inferred from the value passed to `pages` instead of being typed as `any`.

```js
OGImageRoute({
  pages: {
   'example': {
     title: 'Example Page',
     description: 'Description of this page shown in smaller text',
   }
  },
  getImageOptions: (path, page) => {
    page
    // ^ { title: string; description: string } 
  }
})
```
