import init from 'canvaskit-wasm';
import fs from 'fs/promises';
import { createRequire } from 'module';
const { resolve } = createRequire(import.meta.url);

const debug = (...args: any[]) => console.debug('[astro-open-graph]', ...args);
const error = (...args: any[]) => console.error('[astro-open-graph]', ...args);

/** CanvasKit singleton. */
export const CanvasKit = await init({
  // TODO: Figure how to reliably resolve this without depending on Node.
  locateFile: (file) => resolve(`canvaskit-wasm/bin/${file}`),
});

const fonts = { loading: Promise.resolve(), cache: new Map<string, ArrayBuffer | undefined>() };

/**
 * Load fonts. Backed by an in-memory cache, so fonts are only downloaded once.
 * @param fontUrls Array of URLs to remote font files (TTF recommended).
 * @returns Array of resolved font data.
 */
export const loadFonts = async (fontUrls: string[]): Promise<ArrayBuffer[]> => {
  await fonts.loading;
  const fontData: ArrayBuffer[] = [];
  let hasNew = false;
  fonts.loading = new Promise(async (resolve) => {
    for (const url of fontUrls) {
      if (!fonts.cache.has(url)) {
        hasNew = true;
        debug('Downloading', url);
        const response = await fetch(url);
        if (response.ok) {
          fonts.cache.set(url, await response.arrayBuffer());
        } else {
          fonts.cache.set(url, undefined);
          error(response.status, response.statusText, '—', url);
        }
      }
      const font = fonts.cache.get(url);
      if (font) fontData.push(font);
    }
    resolve();
  });
  await fonts.loading;
  if (hasNew) logFontsLoaded(fontData);
  return fontData;
};

/**
 * Log to the terminal which font families have been loaded.
 * Mostly useful so users can see the name of families as parsed by CanvasKit.
 */
function logFontsLoaded(fonts: ArrayBuffer[]) {
  const fontMgr = CanvasKit.FontMgr.FromData(...fonts);
  if (fontMgr) {
    const fontCount = fontMgr.countFamilies();
    const fontFamilies = [];
    for (let i = 0; i < fontCount; i++) {
      fontFamilies.push(fontMgr.getFamilyName(i));
    }
    debug('Loaded', fontCount, 'font families:\n' + fontFamilies.join(', '));
  }
}

const images = { cache: new Map<string, Buffer>(), loading: Promise.resolve() };

/**
 * Load an image. Backed by an in-memory cache to avoid repeat disk-reads.
 * @param path Path to an image file, e.g. `./src/logo.png`.
 * @returns Buffer containing the image contents.
 */
export const loadImage = async (path: string): Promise<Buffer> => {
  await images.loading;
  let image: Buffer;
  images.loading = new Promise(async (resolve) => {
    const cached = images.cache.get(path);
    if (cached) {
      image = cached;
    } else {
      // TODO: Figure out if there’s deno-compatible way to load images.
      image = await fs.readFile(path);
      images.cache.set(path, image);
    }
    resolve();
  });
  await images.loading;
  return image!;
};
