// Shared post-listing helpers (kept out of page.tsx files: Next.js pages may
// only export route fields).
import dayjs from 'dayjs';

import { slugify } from '@semantic/utils';

import { allPosts, type Post } from './content';

const byNewest = (a: Post, b: Post) => (dayjs(a.createdAt).isAfter(dayjs(b.createdAt)) ? -1 : 1);

export const getSortedPosts = (): Post[] => [...allPosts].sort(byNewest);

export const getCategoryPosts = (category: string): Post[] =>
  [...allPosts.filter((post) => slugify(post.category) === category)].sort(byNewest);

export const getTagPosts = (tag: string): Post[] =>
  [...allPosts.filter((post) => post.tags?.some((t) => slugify(t) === tag))].sort(byNewest);
