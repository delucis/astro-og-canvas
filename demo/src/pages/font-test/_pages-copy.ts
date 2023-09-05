/**
 * An Astro bug means importing the same `_pages.ts` into both `index.astro`
 * and `[path].ts` triggers an error. Duplicating the data so that each route
 * imports its own copy works fine.
 */
export const pages: Record<string, { title: string; description: string; dir?: 'rtl' | 'ltr' }> = {
  'ar-editor-setup.md': {
    title: 'إعداد البيئة البرمجية',
    description: 'أعِد محرر الشفرة لبناء المشاريع مع Astro',
    dir: 'rtl',
  },
  'markdown.md': {
    title: 'Markdown & MDX',
    description: 'Learn how to create content using Markdown or MDX with Astro',
  },
  'components.md': {
    title: 'Components',
    description: 'An intro to the .astro component syntax.',
  },
  'project-structure.md': {
    title: 'Project Structure',
    description: 'Learn how to structure a project with Astro.',
  },
  'why-astro.md': {
    title: 'Why Astro?',
    description:
      'Astro is an all-in-one web framework for building fast, content-focused websites. Learn more.',
  },
  'install-auto.md': {
    title: 'Install Astro with the Automatic CLI',
    description: 'How to install Astro with NPM, PNPM, or Yarn via the create-astro CLI tool.',
  },
  'zh-editor-setup.md': {
    title: '编辑器配置',
    description: '配置与 Astro 一同使用的编辑器',
  },
  'ru-getting-started.md': {
    title: 'Начало Работы',
    description: 'Основное введение в Astro.',
  },
  'de-config-reference.md': {
    title: 'Konfigurations&shy;referenz',
    description: '',
  },
  'en-concepts-mpa-vs-spa.md': {
    title: 'MPAs vs. SPAs',
    description:
      'Understanding the tradeoffs between Multi-Page Application (MPA) and Single-Page Application (SPA) architecture is key to understanding what makes Astro different from other web frameworks.',
  },
  'es-guides-deploy-flightcontrol.md': {
    title: 'Despliega tu proyecto de Astro en AWS con Flightcontrol',
    description: 'Cómo desplegar tu proyecto de Astro en AWS con Flightcontrol',
  },
};
