import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Pagination, PostList } from '@semantic/components/ui';
import { POST, ROUTES } from '@semantic/constants';
import { allPosts } from '@semantic/lib/content';
import { getTagPosts } from '@semantic/lib/post-utils';
import { generatePageMetadata, slugify } from '@semantic/utils';

type PagedTagsPageProps = {
  params: Promise<{ tag: string; page: string }>;
};

const PagedTagsPage = async ({ params }: PagedTagsPageProps) => {
  const { tag, page } = await params;
  const currentPage = parseInt(page, 10);

  if (Number.isNaN(currentPage) || currentPage < 2) notFound();

  const tagPosts = getTagPosts(tag);
  const start = (currentPage - 1) * POST.PER_PAGE;
  const currentPosts = tagPosts.slice(start, start + POST.PER_PAGE);

  if (currentPosts.length === 0) notFound();

  const tagName = tagPosts[0]?.tags?.find((t) => slugify(t) === tag) ?? tag;

  return (
    <>
      <h1 className="h3 mb-[1.875rem] text-[var(--color-gray-light)]">
        {tagName} ({tagPosts.length})
      </h1>
      <PostList posts={currentPosts} />
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(tagPosts.length / POST.PER_PAGE)}
        basePath={`${ROUTES.TAGS}/${tag}`}
      />
    </>
  );
};

export default PagedTagsPage;

export const generateStaticParams = () => {
  const tags = [...new Set(allPosts.flatMap((post) => post.tags || []))];

  return tags.flatMap((tag) => {
    const count = allPosts.filter((post) => post.tags?.includes(tag)).length;
    const totalPages = Math.ceil(count / POST.PER_PAGE);
    // Static export needs at least one param per tag; page "2" renders
    // not-found when there is only a single page.
    const pages = totalPages < 2 ? [2] : Array.from({ length: totalPages - 1 }, (_, i) => i + 2);

    return pages.map((page) => ({ tag: slugify(tag), page: page.toString() }));
  });
};

export const generateMetadata = async ({ params }: PagedTagsPageProps): Promise<Metadata> => {
  const { tag, page } = await params;
  const current = parseInt(page, 10);

  const tagPosts = allPosts.filter((post) => post.tags?.some((t) => slugify(t) === tag));
  const tagName = tagPosts[0]?.tags?.find((t) => slugify(t) === tag) ?? tag;

  return generatePageMetadata({
    title: `${tagName} - Page ${current}`,
    path: `${ROUTES.TAGS}/${tag}/page/${current}`,
  });
};
