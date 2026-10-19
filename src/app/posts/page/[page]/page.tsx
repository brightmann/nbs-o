import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Pagination, PostList } from '@semantic/components/ui';
import { POST, ROUTES } from '@semantic/constants';
import { allPosts } from '@semantic/lib/content';
import { getSortedPosts } from '@semantic/lib/post-utils';
import { generatePageMetadata } from '@semantic/utils';

type PagedPostsPageProps = {
  params: Promise<{ page: string }>;
};

const PagedPostsPage = async ({ params }: PagedPostsPageProps) => {
  const { page } = await params;
  const currentPage = parseInt(page, 10);

  if (Number.isNaN(currentPage) || currentPage < 2) notFound();

  const start = (currentPage - 1) * POST.PER_PAGE;
  const currentPosts = getSortedPosts().slice(start, start + POST.PER_PAGE);

  if (currentPosts.length === 0) notFound();

  return (
    <>
      <h1 className="h3 mb-[1.875rem] text-[var(--color-gray-light)]">Posts ({allPosts.length})</h1>

      <PostList posts={currentPosts} />

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(allPosts.length / POST.PER_PAGE)}
        basePath={ROUTES.POSTS}
      />
    </>
  );
};

export default PagedPostsPage;

export const generateStaticParams = () => {
  const totalPages = Math.ceil(allPosts.length / POST.PER_PAGE);
  // Static export needs at least one param; page "2" renders not-found when
  // there is only a single page of posts.
  const pages = totalPages < 2 ? [2] : Array.from({ length: totalPages - 1 }, (_, i) => i + 2);

  return pages.map((page) => ({ page: page.toString() }));
};

export const generateMetadata = async ({ params }: PagedPostsPageProps): Promise<Metadata> => {
  const { page } = await params;
  const current = parseInt(page, 10);

  return generatePageMetadata({
    title: `Posts - Page ${current}`,
    path: `${ROUTES.POSTS}/page/${current}`,
  });
};
