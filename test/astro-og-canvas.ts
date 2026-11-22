import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { describe, test } from 'node:test';
import { type OGImageOptions, OGImageRoute } from '../packages/astro-og-canvas/dist/index.js';
import { fontManager } from '../packages/astro-og-canvas/dist/assetLoaders.js';

function loadRoute(path: string): string {
  const rel = `../demo/dist/${path}/index.html`.replaceAll(/\/{2,}/g, '/');
  return readFileSync(new URL(rel, import.meta.url), 'utf-8');
}

function loadImage(path: string) {
  const rel = `../demo/dist/${path}`.replaceAll(/\/{2,}/g, '/');
  return readFileSync(new URL(rel, import.meta.url));
}

describe('build output', () => {
  test('it should have created an image in the build output', () => {
    assert.doesNotThrow(() => loadImage('/og/index.png'));
  });

  test('it should have built the index page correctly', () => {
    const page = loadRoute('/');
    assert.match(page, /<img src="\/og\/index.png" alt="Example image">/);
  });

  test('it should have rendered a JPEG correctly', () => {
    const buff = loadImage('/formats/jpeg.jpeg');
    assert.notEqual(buff.length, 0);
  });
});

describe('OGImageRoute', () => {
  const imageOptions: OGImageOptions = { title: 'Test' };
  const routeConfig: Parameters<typeof OGImageRoute>[0] = {
    pages: { example: {} },
    getImageOptions: () => imageOptions,
  };

  test('it should create static paths from config', async () => {
    const { getStaticPaths } = await OGImageRoute(routeConfig);
    const paths = await getStaticPaths({ routePattern: '/og/[slug].png' } as any);
    assert.deepStrictEqual(paths, [{ params: { slug: 'example.png' }, props: { imageOptions } }]);
  });

  test('it should detect param name from routePattern', async () => {
    const { getStaticPaths } = await OGImageRoute(routeConfig);
    const [slugPath] = await getStaticPaths({ routePattern: '/og/[slug].png' } as any);
    assert.equal(slugPath.params.slug, 'example.png');
    const [routePath] = await getStaticPaths({ routePattern: '/og/[route].png' } as any);
    assert.equal(routePath.params.route, 'example.png');
  });

  test('it should detect param name from routePattern with spread', async () => {
    const { getStaticPaths } = await OGImageRoute(routeConfig);
    const [slugPath] = await getStaticPaths({ routePattern: '/og/[...slug].png' } as any);
    assert.equal(slugPath.params.slug, 'example.png');
    const [routePath] = await getStaticPaths({ routePattern: '/og/[...route].png' } as any);
    assert.equal(routePath.params.route, 'example.png');
  });

  test('it should throw if route pattern has no parameter', async () => {
    const { getStaticPaths } = await OGImageRoute(routeConfig);
    await assert.rejects(
      async () => getStaticPaths({ routePattern: '/og/index' } as any),
      /No parameter found in route: `\/og\/index`/,
    );
  });

  test('it should throw if route pattern has multiple parameters', async () => {
    const { getStaticPaths } = await OGImageRoute(routeConfig);
    await assert.rejects(
      async () => getStaticPaths({ routePattern: '/og/[slug]/[id]' } as any),
      /Multiple parameters found in route: `\/og\/\[slug\]\/\[id\]`/,
    );
  });
});

describe('fontManager', () => {
  test('it should hash the contents of remote fonts', async (t) => {
    const fonts: Record<string, Buffer> = {
      '/a.ttf': readFileSync(
        new URL(
          '../demo/src/pages/local-font-test/_fonts/ibm-plex-mono-latin-400-normal.ttf',
          import.meta.url,
        ),
      ),
      '/b.ttf': Buffer.from('not the same font data'),
    };
    const server = createServer((req, res) => res.end(fonts[req.url!]));
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    t.after(() => server.close());
    const { port } = server.address() as AddressInfo;
    const [urlA, urlB] = ['/a.ttf', '/b.ttf'].map((path) => `http://127.0.0.1:${port}${path}`);

    await fontManager.get([urlA, urlB]);
    assert.notEqual(fontManager.getHash(urlA), fontManager.getHash(urlB));
  });
});
