// Content registry — replaces `@contentlayer/generated`.
//
// `src/content/generated.json` is produced at build time by
// `scripts/build-content.mjs` (run via `pnpm build:content`, which `pnpm build`
// runs first). Importing JSON keeps every page a pure static render with no
// `new Function()` MDX eval at runtime (forbidden on Cloudflare Workers).
import generated from '../content/generated.json';

export type BlurData = {
  blur: string;
  ratio: number;
};

export type Post = {
  _id: string;
  slug: string;
  title: string;
  subtitle: string;
  createdAt: string;
  modifiedAt: string;
  coverImage: string;
  coverImageBlur: BlurData;
  category: string;
  tags: string[];
  comments: boolean;
  blurMap: Record<string, BlurData>;
  mdxSource: string;
};

export type ContentPage = {
  _id: string;
  slug: string;
  createdAt: string;
  blurMap: Record<string, BlurData>;
  mdxSource: string;
};

const data = generated as unknown as { posts: Post[]; pages: ContentPage[] };

export const allPosts: Post[] = data.posts;
export const allPages: ContentPage[] = data.pages;
