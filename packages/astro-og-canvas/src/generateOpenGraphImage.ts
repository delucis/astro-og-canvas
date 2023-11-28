import { deterministicString } from 'deterministic-object-hash';
import { decodeHTMLStrict } from 'entities';
import fs from 'node:fs/promises';
import path from 'node:path';
import { CanvasKitPromise, fontManager, loadImage } from './assetLoaders';
import { shorthash } from './shorthash';
import type {
  FontConfig,
  IllogicalSide,
  LogicalSide,
  OGImageOptions,
  RGBColor,
  XYWH,
} from './types';

const [width, height] = [1200, 630];
const edges: Record<IllogicalSide, XYWH> = {
  top: [0, 0, width, 0],
  bottom: [0, height, width, height],
  left: [0, 0, 0, height],
  right: [width, 0, width, height],
};
const defaults: {
  border: NonNullable<Required<OGImageOptions['border']>>;
  font: Record<'title' | 'description', Required<FontConfig>>;
} = {
  border: {
    color: [255, 255, 255] as RGBColor,
    width: 0,
    side: 'inline-start' as LogicalSide,
  },
  font: {
    title: {
      color: [255, 255, 255],
      size: 70,
      lineHeight: 1,
      weight: 'Normal',
      families: ['Noto Sans'],
    },
    description: {
      color: [255, 255, 255],
      size: 40,
      lineHeight: 1.3,
      weight: 'Normal',
      families: ['Noto Sans'],
    },
  },
};

class ImageCache {
  #dirCache = new Set<string>();
  /** Ensure the requested directory exists. */
  async #mkdir(dir: string) {
    if (this.#dirCache.has(dir)) return;
    try {
      await fs.mkdir(dir, { recursive: true });
      this.#dirCache.add(dir);
    } catch { }
  }
  /** Retrieve an image from the file system cache if it exists. */
  async get(cachePath: string): Promise<Buffer | undefined> {
    await this.#mkdir(path.dirname(cachePath));
    return await fs.readFile(cachePath).catch(() => undefined);
  }
  /** Write an image to the file system cache. */
  async set(cachePath: string, image: Buffer): Promise<void> {
    await this.#mkdir(path.dirname(cachePath));
    await fs.writeFile(cachePath, image).catch(() => undefined);
  }
}
const imageCache = new ImageCache();

export async function generateOpenGraphImage({
  cacheDir = './node_modules/.astro-og-canvas',
  title,
  description = '',
  dir = 'ltr',
  bgGradient = [[0, 0, 0]],
  bgImage,
  border: borderConfig = {},
  padding = 60,
  logo,
  font: fontConfig = {},
  fonts = ['https://api.fontsource.org/v1/fonts/noto-sans/latin-400-normal.ttf'],
  format = 'PNG',
  quality = 90,
}: OGImageOptions) {
  // Load and configure font families.
  const fontMgr = await fontManager.get(fonts);
  const loadedLogo = logo && (await loadImage(logo.path));
  const loadedBg = bgImage && (await loadImage(bgImage.path));

  /** A deterministic hash based on inputs. */
  const salt = Math.random();
  const hash = shorthash(
    deterministicString([
      salt,
      title,
      description,
      dir,
      bgGradient,
      bgImage,
      borderConfig,
      padding,
      logo,
      fontConfig,
      fonts,
      quality,
      loadedLogo?.hash,
      loadedBg?.hash,
      fonts.map((font) => fontManager.getHash(font)),
    ])
  );

  let cacheFilePath: string | undefined;
  if (cacheDir) {
    cacheFilePath = path.join(cacheDir, `${hash}.${format.toLowerCase()}`);
    const cached = await imageCache.get(cacheFilePath);
    if (cached) return cached;
  }

  const border = { ...defaults.border, ...borderConfig };
  const font = {
    title: { ...defaults.font.title, ...fontConfig.title },
    description: { ...defaults.font.description, ...fontConfig.description },
  };

  const isRtl = dir === 'rtl';
  const margin: Record<LogicalSide, number> = {
    'block-start': padding,
    'block-end': padding,
    'inline-start': padding,
    'inline-end': padding,
  };
  margin[border.side] += border.width;

  const CanvasKit = await CanvasKitPromise;

  const textStyle = (fontConfig: Required<FontConfig>) => ({
    color: CanvasKit.Color(...fontConfig.color),
    fontFamilies: fontConfig.families,
    fontSize: fontConfig.size,
    fontStyle: { weight: CanvasKit.FontWeight[fontConfig.weight] },
    heightMultiplier: fontConfig.lineHeight,
  });

  // Set up.
  const surface = CanvasKit.MakeSurface(width, height)!;
  const canvas = surface.getCanvas();

  // Draw background gradient.
  const bgRect = CanvasKit.XYWHRect(0, 0, width, height);
  const bgPaint = new CanvasKit.Paint();
  bgPaint.setShader(
    CanvasKit.Shader.MakeLinearGradient(
      [0, 0],
      [0, height],
      bgGradient.map((rgb) => CanvasKit.Color(...rgb)),
      null,
      CanvasKit.TileMode.Clamp
    )
  );
  canvas.drawRect(bgRect, bgPaint);

  // Draw background image.
  if (bgImage && loadedBg?.buffer) {
    const bgImg = CanvasKit.MakeImageFromEncoded(loadedBg.buffer);
    if (bgImg) {
      if (!bgImage.margin) {
        bgImage.margin = [0, 0, 0, 0];
      } else {
        // if margin is defined, then imply crop
        bgImage.crop = true
      }

      // Define margins
      const [bgTop, bgRight, bgBottom, bgLeft] = bgImage.margin;
      const xMargin = bgRight + bgLeft;
      const yMargin = bgTop + bgBottom;

      const bgH = bgImg.height();
      const bgW = bgImg.width();

      const ratio = bgW / bgH;
      let scaleRatio = 1;
      let targetW = width;
      let targetH = height;

      if (!bgImage.crop) {
        targetW -= xMargin;
        targetH -= yMargin;
      }
      // "cover" scales the image so its smaller size fit the window, "contain" makes the bigger size fit to window
      if (bgImage.size == "cover") {
        scaleRatio = (ratio > 1 ? targetW / bgW : targetH / bgH);
      } else if (bgImage.size == "contain") {
        scaleRatio = (ratio > 1 ? targetH / bgH : targetW / bgW);
      }

      // Matrix transform to scale the logo to the desired size.
      const bgImagePaint = new CanvasKit.Paint();
      bgImagePaint.setImageFilter(
        CanvasKit.ImageFilter.MakeMatrixTransform(
          CanvasKit.Matrix.scaled(scaleRatio, scaleRatio),
          { filter: CanvasKit.FilterMode.Linear },
          null
        )
      );



      // Draw image
      if (bgImage.crop) {
        canvas.drawImage(bgImg, 0, 0, bgImagePaint);
      } else {
        canvas.drawImage(bgImg, bgLeft, bgTop, bgImagePaint);
      }

      // Redraw gradient
      if (bgImage.crop) {
        const gradientFramePaint = new CanvasKit.Paint();
        gradientFramePaint.setShader(
          CanvasKit.Shader.MakeLinearGradient(
            [0, 0],
            [0, height],
            bgGradient.map((rgb) => CanvasKit.Color(...rgb)),
            null,
            CanvasKit.TileMode.Clamp
          )
        );

        // Draw 4 gradients to make a frame over the image
        const topRect = CanvasKit.XYWHRect(0, 0, width, bgTop);
        const rightRect = CanvasKit.XYWHRect(width - bgRight, 0, bgRight, height);
        const bottomRect = CanvasKit.XYWHRect(0, height - bgBottom, width, bgBottom);
        const leftRect = CanvasKit.XYWHRect(0, 0, bgLeft, height);
        canvas.drawRect(topRect, gradientFramePaint);
        canvas.drawRect(rightRect, gradientFramePaint);
        canvas.drawRect(bottomRect, gradientFramePaint);
        canvas.drawRect(leftRect, gradientFramePaint);
      }
    }
  }

  // this somehow fix a problem where the logo was misplaced when utilized with background, probably because the canva was scaled down when the image was placed, and then when placing the logo the scale was off.
  // TODO: Make sure this is the proper way.
  CanvasKit.ImageFilter.MakeMatrixTransform(
    CanvasKit.Matrix.scaled(1, 1),
    { filter: CanvasKit.FilterMode.Linear },
    null
  )

  // Draw border.
  if (border.width) {
    const borderStyle = new CanvasKit.Paint();
    borderStyle.setStyle(CanvasKit.PaintStyle.Stroke);
    borderStyle.setColor(CanvasKit.Color(...border.color));
    borderStyle.setStrokeWidth(border.width * 2);
    const borders: Record<LogicalSide, XYWH> = {
      'block-start': edges.top,
      'block-end': edges.bottom,
      'inline-start': isRtl ? edges.right : edges.left,
      'inline-end': isRtl ? edges.left : edges.right,
    };
    canvas.drawLine(...borders[border.side], borderStyle);
  }

  // Draw logo.
  let logoHeight = 0;
  if (logo && loadedLogo?.buffer) {
    const img = CanvasKit.MakeImageFromEncoded(loadedLogo.buffer);
    if (img) {
      const logoH = img.height();
      const logoW = img.width();
      const targetW = logo.size?.[0] ?? logoW;
      const targetH = logo.size?.[1] ?? (targetW / logoW) * logoH;
      const xRatio = targetW / logoW;
      const yRatio = targetH / logoH;
      logoHeight = targetH;

      // Matrix transform to scale the logo to the desired size.
      const imagePaint = new CanvasKit.Paint();
      imagePaint.setImageFilter(
        CanvasKit.ImageFilter.MakeMatrixTransform(
          CanvasKit.Matrix.scaled(xRatio, yRatio),
          { filter: CanvasKit.FilterMode.Linear },
          null
        )
      );

      const imageLeft = isRtl
        ? (1 / xRatio) * (width - margin['inline-start']) - logoW
        : (1 / xRatio) * margin['inline-start'];

      canvas.drawImage(img, imageLeft, (1 / yRatio) * margin['block-start'], imagePaint);
    }
  }

  if (fontMgr) {
    // Create paragraph with initial styles and add title.
    const paragraphStyle = new CanvasKit.ParagraphStyle({
      textAlign: isRtl ? CanvasKit.TextAlign.Right : CanvasKit.TextAlign.Left,
      textStyle: textStyle(font.title),
      textDirection: isRtl ? CanvasKit.TextDirection.RTL : CanvasKit.TextDirection.LTR,
    });
    const paragraphBuilder = CanvasKit.ParagraphBuilder.Make(paragraphStyle, fontMgr);
    paragraphBuilder.addText(decodeHTMLStrict(title));

    // Add small empty line betwen title & description.
    paragraphBuilder.pushStyle(
      new CanvasKit.TextStyle({ fontSize: padding / 3, heightMultiplier: 1 })
    );
    paragraphBuilder.addText('\n\n');

    // Add description.
    paragraphBuilder.pushStyle(new CanvasKit.TextStyle(textStyle(font.description)));
    paragraphBuilder.addText(decodeHTMLStrict(description));

    // Draw paragraph to canvas.
    const para = paragraphBuilder.build();
    const paraWidth = width - margin['inline-start'] - margin['inline-end'] - padding;
    para.layout(paraWidth);
    const paraLeft = isRtl
      ? width - margin['inline-start'] - para.getMaxWidth()
      : margin['inline-start'];
    const minTop = margin['block-start'] + logoHeight + (logoHeight ? padding : 0);
    const maxTop = minTop + (logoHeight ? padding : 0);
    const naturalTop = height - margin['block-end'] - para.getHeight();
    const paraTop = Math.max(minTop, Math.min(maxTop, naturalTop));
    canvas.drawParagraph(para, paraLeft, paraTop);
  }

  // Render canvas to a buffer.
  const image = surface.makeImageSnapshot();
  const imageBytes =
    image.encodeToBytes(CanvasKit.ImageFormat[format], quality) || new Uint8Array();

  // Free any memory our surface might be hanging onto.
  surface.dispose();

  const imgBuffer = Buffer.from(imageBytes);

  if (cacheFilePath) await imageCache.set(cacheFilePath, imgBuffer);
  return imgBuffer;
}
