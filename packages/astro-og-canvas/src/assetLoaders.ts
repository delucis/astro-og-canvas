import init, { type FontMgr } from 'canvaskit-wasm/full';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { shorthash } from './shorthash';
const { resolve } = createRequire(import.meta.url);

const debug = (...args: any[]) => console.debug('[astro-og-canvas]', ...args);
const error = (...args: any[]) => console.error('[astro-og-canvas]', ...args);

/** CanvasKit singleton. */
export const CanvasKitPromise = init({
  // TODO: Figure how to reliably resolve this without depending on Node.
  locateFile: (file) => resolve(`canvaskit-wasm/bin/full/${file}`),
});

class FontManager {
  /** Font data cache to avoid repeat downloads. */
  readonly #cache = new Map<string, ArrayBuffer | undefined>();
  readonly #hashCache = new Map<string, string>();
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
        debug('Loading', url);
        if (/^https?:\/\//.test(url)) {
          const response = await fetch(url);
          if (response.ok) {
            this.#cache.set(url, await response.arrayBuffer());
          } else {
            this.#cache.set(url, undefined);
            error(response.status, response.statusText, '—', url);
          }
        } else {
          const file = await fs.readFile(url);
          this.#cache.set(url, file);
        }
      }
      resolve();
    });
    await this.#loading;
    if (hasNew) await this.#updateManager();
    return this.#manager!;
  }

  /** Get a short hash for a given font resource. */
  getHash(url: string): string {
    let hash = this.#hashCache.get(url) || '';
    if (hash) return hash;
    const buffer = this.#cache.get(url);
    hash = buffer ? shorthash(Buffer.from(buffer).toString()) : '';
    this.#hashCache.set(url, hash);
    return hash;
  }
}
export const fontManager = new FontManager();

interface LoadedImage {
  /** Pixel buffer for the loaded image. */
  buffer: Buffer;
  /** Short hash of the image’s buffer. */
  hash: string;
}

const images = { cache: new Map<string, LoadedImage>(), loading: Promise.resolve() };

/**
 * Load an image. Backed by an in-memory cache to avoid repeat disk-reads.
 * @param path Path to an image file, e.g. `./src/logo.png`.
 * @returns Buffer containing the image contents.
 */
export const loadImage = async (path: string): Promise<LoadedImage> => {
  await images.loading;
  let image: LoadedImage;
  images.loading = new Promise(async (resolve) => {
    const cached = images.cache.get(path);
    if (cached) {
      image = cached;
    } else {
      // TODO: Figure out if there’s deno-compatible way to load images.
      const buffer = await fs.readFile(path);
      image = { buffer, hash: shorthash(buffer.toString()) };
      images.cache.set(path, image);
    }
    resolve();
  });
  await images.loading;
  return image!;
};
