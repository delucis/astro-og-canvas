import type { APIRoute, GetStaticPaths } from 'astro';
import { AstroError } from 'astro/errors';
import { generateOpenGraphImage } from './generateOpenGraphImage.js';
import type { OGImageOptions } from './types';

const pathToSlug = (path: string, _page: any, imageOptions: OGImageOptions): string => {
  const format = imageOptions.format || 'PNG';
  const extension = '.' + format.toLowerCase();
  path = path.replace(/^\/src\/pages\//, '');
  path = path.replace(/\.[^\.]*$/, '') + extension;
  path = path.replace(/\/index\.(png|jpeg|webp)$/, extension);
  return path;
};

async function makeGetStaticPaths({
  pages,
  getSlug = pathToSlug,
  getImageOptions,
}: OGImageRouteConfig<any>): Promise<GetStaticPaths> {
  const entries = await Promise.all(
    Object.entries(pages).map(async (page) => {
      const imageOptions = await getImageOptions(...page);
      const slug = getSlug(...page, imageOptions);
      return { slug, imageOptions };
    }),
  );
  return function getStaticPaths({ routePattern }) {
    const param = routePatternToParam(routePattern);
    return entries.map(({ slug, imageOptions }) => ({
      params: { [param]: slug },
      props: { imageOptions },
    }));
  };
}

function createOGImageEndpoint(): APIRoute {
  return async function getOGImage({ props }) {
    return new Response(await generateOpenGraphImage(props.imageOptions));
  };
}

export async function OGImageRoute<T>(opts: OGImageRouteConfig<T>): Promise<{
  getStaticPaths: GetStaticPaths;
  GET: APIRoute;
}> {
  return {
    getStaticPaths: await makeGetStaticPaths(opts),
    GET: createOGImageEndpoint(),
  };
}

interface OGImageRouteConfig<T extends unknown> {
  pages: { [path: string]: T };
  getSlug?: (path: string, page: T, imageOptions: OGImageOptions) => string;
  getImageOptions: (path: string, page: T) => OGImageOptions | Promise<OGImageOptions>;
}

/**
 * Converts a `routePattern` from Astro's `getStaticPaths()` to a parameter name.
 * For example, extracts `slug` from both `/og/[slug].png` and `/og/[...slug].png`.
 */
function routePatternToParam(routePattern: string): string {
  const matches = routePattern.matchAll(/\[(?:\.{3})?(?<param>.+?)\]/g);
  let param: string | undefined;
  let paramCount = 0;
  for (const { groups } of matches) {
    if (groups?.param) {
      param = groups.param;
      paramCount++;
    }
  }
  if (!param) {
    throw new AstroError(
      `No parameter found in route: \`${routePattern}\``,
      'Make sure the open graph image file name contains a dynamic route parameter, e.g. `src/pages/og/[...slug].ts`.\n\n' +
        'See https://docs.astro.build/en/guides/routing/#dynamic-routes for more information on dynamic routes.',
    );
  }
  if (paramCount > 1) {
    throw new AstroError(
      `Multiple parameters found in route: \`${routePattern}\``,
      'Make sure the open graph image file name only contains one dynamic route parameter, e.g. `src/pages/og/[...slug].ts`.\n\n' +
        'See https://docs.astro.build/en/guides/routing/#dynamic-routes for more information on dynamic routes.',
    );
  }
  return param;
}
