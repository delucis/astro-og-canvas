import type { CanvasKit } from 'canvaskit-wasm';

export type RGBColor = [r: number, g: number, b: number];
export type XYWH = [x: number, y: number, w: number, h: number];
export type LogicalSide = 'block-start' | 'inline-end' | 'block-end' | 'inline-start';
export type IllogicalSide = 'top' | 'right' | 'bottom' | 'left';
export type LogicalPosition = 'start' | 'center' | 'end';

export interface FontConfig {
  /** RGB text color. Default: `[255, 255, 255]` */
  color?: RGBColor;
  /** Font size. Title default is `70`, description default is `40`. */
  size?: number;
  /** Font weight. Make sure you provide a URL for the matching font weight. */
  weight?: Exclude<keyof CanvasKit['FontWeight'], 'values'>;
  /** Line height, a.k.a. leading. */
  lineHeight?: number;
  /**
   * Font families to use to render this text. These must be loaded using the
   * top-level `fonts` config option.
   *
   * Similar to CSS, this operates as a “font stack”. The first family in the
   * list will be preferred with next entries used if a glyph isn’t in earlier
   * families. Useful for providing fallbacks for different alphabets etc.
   *
   * Example: `['Noto Sans', 'Noto Sans Arabic']`
   */
  families?: string[];
}

export interface OGImageOptions {
  /**
   * Directory to use for caching images across builds.
   * Set to `false` to disable caching.
   * Default: `./node_modules/.astro-og-canvas`
   */
  cacheDir?: string | false;
  /** Page title. */
  title: string;
  /** Short page description. */
  description?: string;
  /** Writing direction. Default: `'ltr'`. Set to `'rtl'` for Arabic, Hebrew, etc. */
  dir?: 'rtl' | 'ltr';
  /** Optional site logo. Displayed at the top of the card. */
  logo?: {
    /** Path to the logo image file, e.g. `'./src/logo.png'` */
    path: string;
    /**
     * Size to display logo at.
     * - `undefined` — Use original image file dimensions. (Default)
     * - `[width]` — Resize to the specified width, height will be resize proportionally.
     * - `[width, height]` — Resized to the specified width and height.
     */
    size?: [width?: number, height?: number];
  };
  /**
   * Array of `[R, G, B]` colors to use in the background gradient,
   * e.g. `[[255, 0, 0], [0, 0, 255]]` (red to blue).
   * For a solid color, only include a single color, e.g. `[[0, 0, 0]]`
   */
  bgGradient?: RGBColor[];

  /**
   * Background Image
   */
  bgImage?: {
    path: string;
    /**
     * How the background image should resize to fit the container.
     *
     * Default: `'none'`
     *
     * Options:
     * - `'none'` — The image is displayed at original size even if that’s larger or smaller than the container
     * - `'cover'` — The image is sized to maintain its aspect ratio while filling the entire container.
     *   If the image’s aspect ratio does not match the aspect ratio of the container, then the image will be clipped to fit.
     * - `'fill'` — The image is sized to fill the entire container.
     *   If the image’s aspect ratio does not match the aspect ratio of the container, then the image will be stretched to fit.
     * - `'contain'` — The image is scaled to maintain its aspect ratio while fitting within the container.
     *   The image will be “letter-boxed” if its aspect ratio does not match the aspect ratio of the container.
     */
    fit?: 'cover' | 'contain' | 'none' | 'fill';
    /**
     * The position of the background image.
     *
     * Default: `'center'`
     *
     * The value is either a shorthand for both block and inline directions, e.g. `'center'`,
     * or a tuple of `[blockPosition, inlinePosition]`, e.g. `['end', 'center']`.
     *
     * Examples:
     * - `'start'` — place the image at the top-left (or top-right for RTL languages)
     * - `'center'` (default) — center the image horizontally and vertically
     * - `['start', 'end']` — place the image at the top
     */
    position?: LogicalPosition | [LogicalPosition, LogicalPosition];
  };

  /** Border config. Highlights a single edge of the image. */
  border?: {
    /** RGB border color, e.g. `[0, 255, 0]`. */
    color?: RGBColor;
    /** Border width. Default: `0`. */
    width?: number;
    /** Side of the image to draw the border on. Inline start/end respects writing direction. */
    side?: LogicalSide;
  };
  /** Amount of padding between the image edge and text. Default: `60`. */
  padding?: number;
  /** Font styles. */
  font?: {
    /** Font style for the page title. */
    title?: FontConfig;
    /** Font style for the page description. */
    description?: FontConfig;
  };
  /**
   * Array of font URLs or file paths to load and use when rendering text.
   *
   * @example
   * {
   *   fonts: [
   *     // Local font file path relative to the project root:
   *     './src/fonts/local-font.ttf',
   *     // URL to a font file on a remote web server:
   *     'https://example.com/cdn/remote-font.ttf'
   *   ],
   * }
   */
  fonts?: string[];
  /** Image format to save to. Default: `'PNG'` */
  format?: Exclude<keyof CanvasKit['ImageFormat'], 'values'>;
  /** Image quality between `0` (very lossy) and `100` (least lossy). Not used by all formats. */
  quality?: number;
}
