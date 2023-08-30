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
}: OGImageRouteConfig): GetStaticPaths {
  const slugs = Object.entries(pages).map((page) => getSlug(...page));
  const paths = slugs.map((slug) => ({ params: { [param]: slug } }));
  return function getStaticPaths() {
    return paths;
  };
}

function createOGImageEndpoint({ getSlug = pathToSlug, ...opts }: OGImageRouteConfig): APIRoute {
  return async function getOGImage({ params }) {
    const pageEntry = Object.entries(opts.pages).find(
      (page) => getSlug(...page) === params[opts.param]
    );
    if (!pageEntry) return new Response('Page not found', { status: 404 });

    return new Response(await generateOpenGraphImage(
      await opts.getImageOptions(...pageEntry)
    ));
  };
}

export function OGImageRoute(opts: OGImageRouteConfig): {
  getStaticPaths: GetStaticPaths;
  get: APIRoute;
} {
  return {
    getStaticPaths: makeGetStaticPaths(opts),
    get: createOGImageEndpoint(opts),
  };
}

interface OGImageRouteConfig {
  pages: { [path: string]: any };
  param: string;
  getSlug?: (path: string, page: any) => string;
  getImageOptions: (path: string, page: any) => OGImageOptions | Promise<OGImageOptions>;
}
