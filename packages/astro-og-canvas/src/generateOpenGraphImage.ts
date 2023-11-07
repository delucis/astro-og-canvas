import { decodeHTMLStrict } from 'entities';

import { CanvasKitPromise, fontManager, loadImage } from './assetLoaders';
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

export async function generateOpenGraphImage({
  cacheDir = './node_modules/.astro-open-graph',
  title,
  description = '',
  dir = 'ltr',
  bgGradient = [[0, 0, 0]],
  border: borderConfig = {},
  padding = 60,
  logo,
  font: fontConfig = {},
  fonts = ['https://api.fontsource.org/v1/fonts/noto-sans/latin-400-normal.ttf'],
  format = 'PNG',
  quality = 90,
}: OGImageOptions) {
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
  if (logo) {
    const imgBuf = await loadImage(logo.path);
    const img = CanvasKit.MakeImageFromEncoded(imgBuf);
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

  // Load and configure font families.
  const fontMgr = await fontManager.get(fonts);

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

  return Buffer.from(imageBytes);
}
