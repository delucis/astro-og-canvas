---
title: Background Test
description: Test page demonstrating a background image.
layout: ../../layouts/Layout.astro
---

# Astro OpenGraph Images with CanvasKit

This test loads a background image with various settings.

<div class="grid">
  <img alt="Example image" src="/background-test/contain.png">
  <img alt="Example image" src="/background-test/cover.png">
  <img alt="Example image" src="/background-test/crop.png">
  <img alt="Example image" src="/background-test/cropNcover.png">
  <img alt="Example image" src="/background-test/default.png">
  <img alt="Example image" src="/background-test/margin.png">
</div>

- [Home](/)

<style>
  .grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr))
  }
  img {
    max-width: 100%;
    height: auto;
  }
</style>
