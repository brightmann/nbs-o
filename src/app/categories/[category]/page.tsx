import { type Metadata } from 'next';

import { Pagination, PostList } from '@semantic/components/ui';
import { POST, ROUTES } from '@semantic/constants';
import { allPosts } from '@semantic/lib/content';
import { getCategoryPosts } from '@semantic/lib/post-utils';
import { generatePageMetadata, slugify } from '@semantic/utils';

type CategoriesPageProps = {
  params: Promise<{ category: string }>;
};

const CategoriesPage = async ({ params }: CategoriesPageProps) => {
  const { category } = await params;

  const categoryPosts = getCategoryPosts(category);
  const currentPosts = categoryPosts.slice(0, POST.PER_PAGE);

  return (
    <>
      <h1 className="h3 mb-[1.875rem] text-[var(--color-gray-light)]">
        {categoryPosts.length > 0
          ? `${categoryPosts[0].category} (${categoryPosts.length})`
          : `${category} (0 posts)`}
      </h1>

      <PostList posts={currentPosts} />

      <Pagination
        currentPage={1}
        totalPages={Math.ceil(categoryPosts.length / POST.PER_PAGE)}
        basePath={`${ROUTES.CATEGORIES}/${category}`}
      />
    </>
  );
};

export default CategoriesPage;

export const generateStaticParams = () => {
  const categories = [...new Set(allPosts.map((post) => post.category))];

  return categories.map((category) => ({ category: slugify(category) }));
};

export const generateMetadata = async ({ params }: CategoriesPageProps): Promise<Metadata> => {
  const { category } = await params;
  const categoryPosts = allPosts.filter((post) => slugify(post.category) === category);
  const categoryName = categoryPosts[0]?.category ?? category;

  return generatePageMetadata({
    title: categoryName,
    path: `${ROUTES.CATEGORIES}/${category}`,
  });
};
