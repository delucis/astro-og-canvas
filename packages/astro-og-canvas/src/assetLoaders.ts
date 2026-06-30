import type { CanvasKit, FontMgr } from 'canvaskit-wasm/full';
import { Buffer } from 'node:buffer';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pQueue } from './queue.js';
import { shorthash } from './shorthash.js';
const { resolve } = createRequire(import.meta.url);

const debug = (...args: any[]) => console.debug('[astro-og-canvas]', ...args);
const error = (...args: any[]) => console.error('[astro-og-canvas]', ...args);

/** CanvasKit singleton. */
let canvasKitSingleton: CanvasKit;
export async function getCanvasKit(): Promise<CanvasKit> {
  if (!canvasKitSingleton) {
    try {
      const { default: init } = await import('canvaskit-wasm/full');
      canvasKitSingleton = await init({
        // TODO: Figure how to reliably resolve this without depending on Node.
        locateFile: (file) => resolve(`canvaskit-wasm/bin/full/${file}`),
      });
    } catch (e) {
      throw formatCanvasKitInitError(e);
    }
  }
  return canvasKitSingleton;
}

function formatCanvasKitInitError(e: unknown) {
  if (e instanceof Error && e.message.includes('__dirname is not defined')) {
    e.message +=
      '\n\n' +
      'This error is often thrown when using PNPM without installing `canvaskit-wasm` directly.\n' +
      'Install this required dependency by running `pnpm add canvaskit-wasm`\n';
  }
  return e;
}

class FontManager {
  /** Font data cache to avoid repeat downloads. */
  readonly #cache = new Map<string, Buffer | ArrayBuffer | undefined>();
  readonly #hashCache = new Map<string, string>();
  /** Queue to co-ordinate `#get` calls to run sequentially. */
  #queue = pQueue();
  /** Current `CanvasKit.FontMgr` instance. */
  #manager?: FontMgr;

  /** Get a `CanvasKit.FontMgr` instance with all the currently cached fonts, creating a new one if needed. */
  async #getOrCreateManager(shouldUpdate: boolean): Promise<FontMgr> {
    if (!shouldUpdate && this.#manager) {
      return this.#manager;
    }

    const CanvasKit = await getCanvasKit();
    const fontData = Array.from(this.#cache.values()).filter((v) => !!v) as ArrayBuffer[];
    this.#manager = CanvasKit.FontMgr.FromData(...fontData)!;

    // Log to the terminal which font families have been loaded.
    // Mostly useful so users can see the name of families as parsed by CanvasKit.
    const fontCount = this.#manager.countFamilies();
    const fontFamilies = [];
    for (let i = 0; i < fontCount; i++) fontFamilies.push(this.#manager.getFamilyName(i));
    debug('Loaded', fontCount, 'font families:\n' + fontFamilies.join(', '));

    return this.#manager;
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
    return this.#queue(async () => {
      let hasNew = false;
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
      return this.#getOrCreateManager(hasNew);
    });
  }

  /** Get a short hash for a given font resource. */
  getHash(url: string): string {
    let hash = this.#hashCache.get(url) || '';
    if (hash) return hash;
    const buffer = this.#cache.get(url);
    hash = buffer ? shorthash(buffer.toString()) : '';
    this.#hashCache.set(url, hash);
    return hash;
  }
}
export const fontManager: FontManager = new FontManager();

interface LoadedImage {
  /** Pixel buffer for the loaded image. */
  buffer: Buffer;
  /** Short hash of the image’s buffer. */
  hash: string;
}

const images = { cache: new Map<string, LoadedImage>(), queue: pQueue() };

/**
 * Load an image. Backed by an in-memory cache to avoid repeat disk-reads.
 * @param path Path to an image file, e.g. `./src/logo.png`.
 * @returns Buffer containing the image contents.
 */
export const loadImage = async (path: string): Promise<LoadedImage> =>
  images.queue(async () => {
    const cached = images.cache.get(path);
    if (cached) {
      return cached;
    } else {
      // TODO: Figure out if there’s deno-compatible way to load images.
      const buffer = await fs.readFile(path);
      const image = { buffer, hash: shorthash(buffer.toString()) };
      images.cache.set(path, image);
      return image;
    }
  });
