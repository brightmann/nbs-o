import type { MetadataRoute } from 'next';

import { METADATA, POST, ROUTES } from '@semantic/constants';
import { allPosts } from '@semantic/lib/content';
import { slugify } from '@semantic/utils';

export const dynamic = 'force-static';
export const revalidate = false;

const generateSitemapUrls = (): MetadataRoute.Sitemap => {
  const posts = allPosts;
  const postsPageCount = Math.ceil(posts.length / POST.PER_PAGE);

  const categoryCountMap = posts.reduce<Record<string, number>>((map, { category }) => {
    map[category] = (map[category] || 0) + 1;
    return map;
  }, {});

  const categoryUrls = Object.entries(categoryCountMap).flatMap(([category, count]) => {
    const categorySlug = slugify(category);
    const categoryPages = Math.ceil(count / POST.PER_PAGE);
    return [
      { url: `${METADATA.SITE.URL}${ROUTES.CATEGORIES}/${categorySlug}` },
      ...Array.from({ length: Math.max(0, categoryPages - 1) }, (_, pageIndex) => ({
        url: `${METADATA.SITE.URL}${ROUTES.CATEGORIES}/${categorySlug}/page/${pageIndex + 2}`,
      })),
    ];
  });

  const tagCountMap = posts.reduce<Record<string, number>>((map, { tags }) => {
    tags?.forEach((tag) => {
      map[tag] = (map[tag] || 0) + 1;
    });
    return map;
  }, {});

  const tagUrls = Object.entries(tagCountMap).flatMap(([tag, count]) => {
    const tagSlug = slugify(tag);
    const tagPages = Math.ceil(count / POST.PER_PAGE);
    return [
      { url: `${METADATA.SITE.URL}${ROUTES.TAGS}/${tagSlug}` },
      ...Array.from({ length: Math.max(0, tagPages - 1) }, (_, pageIndex) => ({
        url: `${METADATA.SITE.URL}${ROUTES.TAGS}/${tagSlug}/page/${pageIndex + 2}`,
      })),
    ];
  });

  return [
    { url: `${METADATA.SITE.URL}${ROUTES.ABOUT}` },
    { url: `${METADATA.SITE.URL}${ROUTES.CATEGORIES}` },
    { url: `${METADATA.SITE.URL}${ROUTES.TAGS}` },
    { url: `${METADATA.SITE.URL}${ROUTES.POSTS}` },
    ...categoryUrls,
    ...tagUrls,
    ...Array.from({ length: Math.max(0, postsPageCount - 1) }, (_, pageIndex) => ({
      url: `${METADATA.SITE.URL}${ROUTES.POSTS}/page/${pageIndex + 2}`,
    })),
    ...posts.map(({ slug, modifiedAt, createdAt }) => ({
      url: `${METADATA.SITE.URL}${ROUTES.POSTS}/${slug}`,
      lastModified: modifiedAt ?? createdAt,
      changeFrequency: 'monthly',
      priority: 0.9,
    })),
  ];
};

const sitemapToXml = (
  urls: MetadataRoute.Sitemap,
): string => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `
  <url>
    <loc>${item.url}</loc>
    ${
      item.lastModified
        ? `<lastmod>${
            item.lastModified instanceof Date
              ? item.lastModified.toISOString()
              : new Date(item.lastModified).toISOString()
          }</lastmod>`
        : ''
    }
    ${item.changeFrequency ? `<changefreq>${item.changeFrequency}</changefreq>` : ''}
    ${item.priority ? `<priority>${item.priority}</priority>` : ''}
  </url>`,
  )
  .join('')}
</urlset>`;

export const GET = async (): Promise<Response> => {
  const urls = generateSitemapUrls();
  const xml = sitemapToXml(urls);
  return new Response(xml, {
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  });
};
