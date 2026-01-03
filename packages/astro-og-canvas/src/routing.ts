import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOpenGraphImage } from './generateOpenGraphImage';
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
  param,
  getSlug = pathToSlug,
  getImageOptions,
}: OGImageRouteConfig<any>): Promise<GetStaticPaths> {
  const entries = await Promise.all(
    Object.entries(pages).map(async (page) => {
      const imageOptions = await getImageOptions(...page);
      const slug = getSlug(...page, imageOptions);
      return { slug, imageOptions };
    })
  );
  const paths = entries.map(({ slug, imageOptions }) => ({
    params: { [param]: slug },
    props: { imageOptions },
  }));
  return function getStaticPaths() {
    return paths;
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
  param: string;
  getSlug?: (path: string, page: T, imageOptions: OGImageOptions) => string;
  getImageOptions: (path: string, page: T) => OGImageOptions | Promise<OGImageOptions>;
}
