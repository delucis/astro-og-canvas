import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { describe, test } from 'node:test';

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
