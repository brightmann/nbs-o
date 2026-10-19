import { type Metadata } from 'next';

import { Pagination, PostList } from '@semantic/components/ui';
import { POST, ROUTES } from '@semantic/constants';
import { allPosts } from '@semantic/lib/content';
import { getSortedPosts } from '@semantic/lib/post-utils';
import { generatePageMetadata } from '@semantic/utils';

const PostsPage = () => {
  const currentPosts = getSortedPosts().slice(0, POST.PER_PAGE);

  return (
    <>
      <h1 className="h3 mb-[1.875rem] text-[var(--color-gray-light)]">Posts ({allPosts.length})</h1>

      <PostList posts={currentPosts} />

      <Pagination
        currentPage={1}
        totalPages={Math.ceil(allPosts.length / POST.PER_PAGE)}
        basePath={ROUTES.POSTS}
      />
    </>
  );
};

export default PostsPage;

export const generateMetadata = (): Metadata => {
  return generatePageMetadata({
    title: 'Posts',
    path: ROUTES.POSTS,
  });
};
