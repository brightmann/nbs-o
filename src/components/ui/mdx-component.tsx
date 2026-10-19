// Server-side MDX renderer (replaces contentlayer's useMDXComponent).
//
// MDX is compiled during `next build` by next-mdx-remote/rsc — no
// `new Function()` eval at runtime, which Cloudflare Workers forbids.
// Component overrides are ported 1:1 from the old client-side MdxComponent.
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ComponentProps } from 'react';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkAlerts from 'remark-blockquote-alerts';

import { GiscusTester } from '../mdx/giscus-tester';

type MdxComponentProps = {
  source: string;
  blurDataURLs?: Record<string, { blur: string; ratio: number }>;
};

export const MdxComponent = ({ source, blurDataURLs = {} }: MdxComponentProps) => {
  const components = {
    // Interactive demo embedded by the setup-giscus-comments post
    // (its `import ... from "./giscus-tester"` line is stripped at build time).
    GiscusTester,
    h2: ({ children, ...props }: ComponentProps<'h2'>) => (
      <h2 className="pt-12 text-lg font-semibold" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: ComponentProps<'h3'>) => (
      <h3 className="pt-9 text-md" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }: ComponentProps<'p'>) => (
      <p className="post-body text-[var(--color-gray-accent)]" {...props}>
        {children}
      </p>
    ),
    blockquote: ({ children, ...props }: ComponentProps<'blockquote'>) => (
      <blockquote
        className="column p-4 border border-[var(--color-background04)] rounded-[0.625rem] bg-[var(--color-background02)]"
        {...props}
      >
        {children}
      </blockquote>
    ),
    img: ({
      src,
      alt,
      ...props
    }: { src: string; alt?: string } & Omit<ComponentProps<typeof Image>, 'src' | 'alt'>) => {
      if (!src) return null;

      const imageData = blurDataURLs[src];

      return (
        <span
          className="relative inline-block w-full border border-[var(--color-border)] rounded-[0.875rem] overflow-hidden select-none"
          style={imageData?.ratio ? { aspectRatio: imageData.ratio } : undefined}
        >
          <Image
            className="w-full h-full object-cover"
            src={src}
            alt={alt || ''}
            width={0}
            height={0}
            quality={100}
            placeholder={imageData?.blur ? 'blur' : 'empty'}
            blurDataURL={imageData?.blur}
            sizes="100vw"
            loading="lazy"
            draggable={false}
            {...props}
          />
        </span>
      );
    },
  };

  return (
    <div className="column gap-[1.125rem]" data-mdx-article={true}>
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkAlerts],
            rehypePlugins: [
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: 'wrap' }],
              [rehypePrettyCode, { theme: { dark: 'github-dark-dimmed', light: 'github-light' } }],
            ],
          },
        }}
      />
    </div>
  );
};
