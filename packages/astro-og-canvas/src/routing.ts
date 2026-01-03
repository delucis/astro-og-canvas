import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOpenGraphImage } from './generateOpenGraphImage';
import type { OGImageOptions } from './types';

const pathToSlug = (path: string): string => {
  path = path.replace(/^\/src\/pages\//, '');
  path = path.replace(/\.[^\.]*$/, '') + '.png';
  path = path.replace(/\/index\.png$/, '.png');
  return path;
};

function makeGetStaticPaths({
  pages,
  param,
  getSlug = pathToSlug,
}: OGImageRouteConfig<any>): GetStaticPaths {
  const slugs = Object.entries(pages).map((page) => getSlug(...page));
  const paths = slugs.map((slug) => ({ params: { [param]: slug } }));
  return function getStaticPaths() {
    return paths;
  };
}

function createOGImageEndpoint({
  getSlug = pathToSlug,
  ...opts
}: OGImageRouteConfig<any>): APIRoute {
  return async function getOGImage({ params }) {
    const pageEntry = Object.entries(opts.pages).find(
      (page) => {
        const slug = getSlug(...page);
        return slug === params[opts.param] || slug.replace(/^\//, "") === params[opts.param];
      }
    );
    if (!pageEntry) return new Response('Page not found', { status: 404 });

    return new Response(await generateOpenGraphImage(
      await opts.getImageOptions(...pageEntry)
    ));
  };
}

export function OGImageRoute<T>(opts: OGImageRouteConfig<T>): {
  getStaticPaths: GetStaticPaths;
  GET: APIRoute;
} {
  return {
    getStaticPaths: makeGetStaticPaths(opts),
    GET: createOGImageEndpoint(opts),
  };
}

interface OGImageRouteConfig<T extends unknown> {
  pages: { [path: string]: T };
  param: string;
  getSlug?: (path: string, page: T) => string;
  getImageOptions: (path: string, page: T) => OGImageOptions | Promise<OGImageOptions>;
}
