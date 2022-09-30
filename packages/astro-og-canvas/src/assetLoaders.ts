import type { FontMgr } from 'canvaskit-wasm';
import init from 'canvaskit-wasm';
import fs from 'fs/promises';
import { createRequire } from 'module';
const { resolve } = createRequire(import.meta.url);

const debug = (...args: any[]) => console.debug('[astro-og-canvas]', ...args);
const error = (...args: any[]) => console.error('[astro-og-canvas]', ...args);

/** CanvasKit singleton. */
export const CanvasKitPromise = init({
  // TODO: Figure how to reliably resolve this without depending on Node.
  locateFile: (file) => resolve(`canvaskit-wasm/bin/${file}`),
});

class FontManager {
  /** Font data cache to avoid repeat downloads. */
  readonly #cache = new Map<string, ArrayBuffer | undefined>();
  /** Promise to co-ordinate `#get` calls to run sequentially. */
  #loading = Promise.resolve();
  /** Current `CanvasKit.FontMgr` instance. */
  #manager?: FontMgr;

  /** Instantiate a new `CanvasKit.FontMgr` instance with all the currently cached fonts. */
  async #updateManager(): Promise<void> {
    const CanvasKit = await CanvasKitPromise;
    const fontData = Array.from(this.#cache.values()).filter((v) => !!v) as ArrayBuffer[];
    this.#manager = CanvasKit.FontMgr.FromData(...fontData)!;

    // Log to the terminal which font families have been loaded.
    // Mostly useful so users can see the name of families as parsed by CanvasKit.
    const fontCount = this.#manager.countFamilies();
    const fontFamilies = [];
    for (let i = 0; i < fontCount; i++) fontFamilies.push(this.#manager.getFamilyName(i));
    debug('Loaded', fontCount, 'font families:\n' + fontFamilies.join(', '));
  }

  /**
   * Get a font manager instance for the provided fonts.
   *
   * Fonts are backed by an in-memory cache, so fonts are only downloaded once.
   *
   * Tries to avoid repeated instantiation of `CanvasKit.FontMgr` due to a memory leak
   * in their implementation. Will only reinstantiate if it sees a new font in the
   * `fontUrls` array.
   *
   * @param fontUrls Array of URLs to remote font files (TTF recommended).
   * @returns A font manager for all fonts loaded up until now.
   */
  async get(fontUrls: string[]): Promise<FontMgr> {
    await this.#loading;
    let hasNew = false;
    this.#loading = new Promise<void>(async (resolve) => {
      for (const url of fontUrls) {
        if (this.#cache.has(url)) continue;
        hasNew = true;
        debug('Downloading', url);
        const response = await fetch(url);
        if (response.ok) {
          this.#cache.set(url, await response.arrayBuffer());
        } else {
          this.#cache.set(url, undefined);
          error(response.status, response.statusText, '—', url);
        }
      }
      resolve();
    });
    await this.#loading;
    if (hasNew) this.#updateManager();
    return this.#manager!;
  }
}
export const fontManager = new FontManager();

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
