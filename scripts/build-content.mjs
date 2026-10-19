// Build-time content pipeline — replaces contentlayer2.
//
// Reads content/posts/*/post.mdx and content/pages/*/post.mdx, extracts
// frontmatter, computes sharp blur placeholders, rewrites relative image paths
// to /content/... web paths, and emits src/content/generated.json.
//
// Also copies every non-MDX asset from content/ to public/content/: a static
// export has no middleware or API routes, so /content/* must be plain files.
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import sharp from 'sharp';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content');
const OUT_FILE = path.join(ROOT, 'src', 'content', 'generated.json');
const PUBLIC_CONTENT = path.join(ROOT, 'public', 'content');

const MDX_IMAGE_REGEX = /!\[.*?\]\((.*?)\)/g;
const COVER_CANDIDATES = ['cover.webp', 'cover.png', 'cover.jpg', 'cover.jpeg'];
// Relative imports (e.g. `import { X } from "./component"`) only worked with
// contentlayer's bundler. next-mdx-remote receives a plain string, so strip
// them here; the components are provided via the MDX `components` map instead.
const RELATIVE_IMPORT_REGEX = /^import\s+.*?\s+from\s+['"]\.[^'"]*['"];?\s*$/gm;
const ASSET_EXTENSIONS = new Set([
  '.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.avif', '.ico',
  '.mp4', '.webm', '.mp3', '.wav', '.pdf', '.woff', '.woff2',
]);

const isUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const extractImages = (mdx) => {
  const images = [];
  let match;
  while ((match = MDX_IMAGE_REGEX.exec(mdx))) {
    const imagePath = match[1]?.trim();
    if (imagePath) images.push(imagePath);
  }
  return images;
};

const toISODate = (value, fallback) => {
  if (!value) return fallback;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d.toISOString();
};

const blurData = async (absolutePath) => {
  const buffer = await readFile(absolutePath);
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) throw new Error('no dimensions');
  const { data, info } = await sharp(buffer)
    .resize(128, 128, { fit: 'inside' })
    .blur(5)
    .toBuffer({ resolveWithObject: true });
  return {
    blur: `data:image/${info.format};base64,${data.toString('base64')}`,
    ratio: metadata.width / metadata.height,
  };
};

const emptyBlur = () => ({ blur: '', ratio: 0 });

const buildDocs = async (kind) => {
  const kindDir = path.join(CONTENT_DIR, kind);
  const slugs = await readdir(kindDir);
  const docs = [];

  for (const slug of slugs) {
    const docDir = path.join(kindDir, slug);
    const files = await readdir(docDir);
    const mdxFile = files.find((f) => f.endsWith('.mdx') || f.endsWith('.md'));
    if (!mdxFile) continue;

    const raw = await readFile(path.join(docDir, mdxFile), 'utf8');
    const { data, content } = matter(raw);

    // Drop relative imports — their components come from the MDX components map.
    const mdxWithoutImports = content.replace(RELATIVE_IMPORT_REGEX, '');

    // Rewrite relative image paths to /content/... web paths.
    let mdxSource = mdxWithoutImports;
    const blurMap = {};
    for (const imagePath of extractImages(content)) {
      if (isUrl(imagePath)) continue;
      const clean = imagePath.startsWith('./') ? imagePath.slice(2) : imagePath;
      const webPath = `/content/${kind}/${slug}/${clean}`;
      mdxSource = mdxSource.split(`(${imagePath})`).join(`(${webPath})`);
      try {
        blurMap[webPath] = await blurData(path.join(docDir, clean));
      } catch {
        blurMap[webPath] = emptyBlur();
      }
    }

    const doc = {
      _id: `${kind}/${slug}/${mdxFile}`,
      slug,
      mdxSource,
      blurMap,
    };

    if (kind === 'posts') {
      // coverImage: frontmatter field wins; otherwise fall back to a
      // cover.* file next to the post; otherwise empty (never break the build).
      const field = typeof data.coverImage === 'string' ? data.coverImage : '';
      const coverFile = field
        ? field.startsWith('./')
          ? field.slice(2)
          : field
        : files.find((f) => COVER_CANDIDATES.includes(f.toLowerCase())) ?? '';

      let coverImage = '';
      let coverImageBlur = emptyBlur();
      if (coverFile) {
        coverImage = `/content/${kind}/${slug}/${coverFile}`;
        try {
          coverImageBlur = await blurData(path.join(docDir, coverFile));
        } catch {
          coverImageBlur = emptyBlur();
        }
        blurMap[coverImage] = blurMap[coverImage] ?? coverImageBlur;
      }

      Object.assign(doc, {
        title: data.title ?? slug,
        subtitle: data.subtitle ?? '',
        createdAt: toISODate(data.createdAt, new Date(0).toISOString()),
        modifiedAt: toISODate(data.modifiedAt, toISODate(data.createdAt, new Date(0).toISOString())),
        coverImage,
        coverImageBlur,
        category: data.category ?? 'Uncategorized',
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        comments: data.comments === true,
      });
    } else {
      Object.assign(doc, {
        createdAt: toISODate(data.createdAt, new Date(0).toISOString()),
      });
    }

    docs.push(doc);
  }

  return docs;
};

const main = async () => {
  const [posts, pages] = await Promise.all([buildDocs('posts'), buildDocs('pages')]);

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify({ posts, pages }, null, 2));
  console.log(`generated.json: ${posts.length} posts, ${pages.length} pages`);

  // Static assets: content media files -> public/content/** (source files like
  // .tsx are NOT copied).
  await rm(PUBLIC_CONTENT, { recursive: true, force: true });
  await mkdir(PUBLIC_CONTENT, { recursive: true });
  await cp(CONTENT_DIR, PUBLIC_CONTENT, {
    recursive: true,
    filter: (src) => ASSET_EXTENSIONS.has(path.extname(src).toLowerCase()) || !path.extname(src),
  });
  console.log('content assets copied to public/content');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
