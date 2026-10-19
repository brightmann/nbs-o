import React from 'react';

import { PostGrid } from '@semantic/components/ui';
import { Post } from '@semantic/lib/content';

type RecommendProps = {
  posts: Post[];
};

export const Recommend = ({ posts }: RecommendProps) => {
  return (
    <section aria-labelledby="recommendation-heading">
      <h3
        id="recommendation-heading"
        className="text-[var(--color-gray-accent)] font-mono text-lg font-medium"
      >
        🦾 Check them out
      </h3>
      <PostGrid className="mt-[2.25rem] mb-[3.5rem]" posts={posts} />
    </section>
  );
};
