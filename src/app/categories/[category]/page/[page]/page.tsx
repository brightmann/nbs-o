import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Pagination, PostList } from '@semantic/components/ui';
import { POST, ROUTES } from '@semantic/constants';
import { allPosts } from '@semantic/lib/content';
import { getCategoryPosts } from '@semantic/lib/post-utils';
import { generatePageMetadata, slugify } from '@semantic/utils';

type PagedCategoriesPageProps = {
  params: Promise<{ category: string; page: string }>;
};

const PagedCategoriesPage = async ({ params }: PagedCategoriesPageProps) => {
  const { category, page } = await params;
  const currentPage = parseInt(page, 10);

  if (Number.isNaN(currentPage) || currentPage < 2) notFound();

  const categoryPosts = getCategoryPosts(category);
  const start = (currentPage - 1) * POST.PER_PAGE;
  const currentPosts = categoryPosts.slice(start, start + POST.PER_PAGE);

  if (currentPosts.length === 0) notFound();

  return (
    <>
      <h1 className="h3 mb-[1.875rem] text-[var(--color-gray-light)]">
        {categoryPosts.length > 0
          ? `${categoryPosts[0].category} (${categoryPosts.length})`
          : `${category} (0 posts)`}
      </h1>

      <PostList posts={currentPosts} />

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(categoryPosts.length / POST.PER_PAGE)}
        basePath={`${ROUTES.CATEGORIES}/${category}`}
      />
    </>
  );
};

export default PagedCategoriesPage;

export const generateStaticParams = () => {
  const categories = [...new Set(allPosts.map((post) => post.category))];

  return categories.flatMap((category) => {
    const count = allPosts.filter((post) => post.category === category).length;
    const totalPages = Math.ceil(count / POST.PER_PAGE);
    // Static export needs at least one param per category; page "2" renders
    // not-found when there is only a single page.
    const pages = totalPages < 2 ? [2] : Array.from({ length: totalPages - 1 }, (_, i) => i + 2);

    return pages.map((page) => ({ category: slugify(category), page: page.toString() }));
  });
};

export const generateMetadata = async ({ params }: PagedCategoriesPageProps): Promise<Metadata> => {
  const { category, page } = await params;
  const current = parseInt(page, 10);
  const categoryPosts = allPosts.filter((post) => slugify(post.category) === category);
  const categoryName = categoryPosts[0]?.category ?? category;

  return generatePageMetadata({
    title: `${categoryName} - Page ${current}`,
    path: `${ROUTES.CATEGORIES}/${category}/page/${current}`,
  });
};
