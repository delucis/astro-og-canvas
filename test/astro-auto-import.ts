import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { readFileSync } from 'fs';

function loadRoute(path: string): string {
  const rel = `../demo/dist/${path}/index.html`.replaceAll(/\/{2,}/g, '/');
  return readFileSync(new URL(rel, import.meta.url), 'utf-8');
}

function loadImage(path: string) {
  const rel = `../demo/dist/${path}`.replaceAll(/\/{2,}/g, '/');
  return readFileSync(new URL(rel, import.meta.url));
}

test('it should have created an image in the build output', () => {
  assert.not.throws(()=>loadImage('/og/index.png'));
});

test('it should have built the index page correctly', () => {
  const page = loadRoute('/');
  assert.match(page, /<img src="\/og\/index.png" alt="Example image">/);
});

test.run();