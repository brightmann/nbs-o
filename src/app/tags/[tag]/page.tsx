import { type Metadata } from 'next';

import { Pagination, PostList } from '@semantic/components/ui';
import { POST, ROUTES } from '@semantic/constants';
import { allPosts } from '@semantic/lib/content';
import { getTagPosts } from '@semantic/lib/post-utils';
import { generatePageMetadata, slugify } from '@semantic/utils';

type TagsPageProps = {
  params: Promise<{ tag: string }>;
};

const TagsPage = async ({ params }: TagsPageProps) => {
  const { tag } = await params;

  const tagPosts = getTagPosts(tag);
  const currentPosts = tagPosts.slice(0, POST.PER_PAGE);

  const tagName = tagPosts[0]?.tags?.find((t) => slugify(t) === tag) ?? tag;

  return (
    <>
      <h1 className="h3 mb-[1.875rem] text-[var(--color-gray-light)]">
        {tagName} ({tagPosts.length})
      </h1>
      <PostList posts={currentPosts} />
      <Pagination
        currentPage={1}
        totalPages={Math.ceil(tagPosts.length / POST.PER_PAGE)}
        basePath={`${ROUTES.TAGS}/${tag}`}
      />
    </>
  );
};

export default TagsPage;

export const generateStaticParams = () => {
  const tags = [...new Set(allPosts.flatMap((post) => post.tags || []))];

  return tags.map((tag) => ({ tag: slugify(tag) }));
};

export const generateMetadata = async ({ params }: TagsPageProps): Promise<Metadata> => {
  const { tag } = await params;

  const tagPosts = allPosts.filter((post) => post.tags?.some((t) => slugify(t) === tag));
  const tagName = tagPosts[0]?.tags?.find((t) => slugify(t) === tag) ?? tag;

  return generatePageMetadata({
    title: tagName,
    path: `${ROUTES.TAGS}/${tag}`,
  });
};
