import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MdxComponent } from '@semantic/components/ui';
import { ROUTES } from '@semantic/constants';
import { allPages } from '@semantic/lib/content';
import { generatePageMetadata } from '@semantic/utils';

const AboutPage = () => {
  const about = allPages.find((page) => page.slug === 'about');

  if (!about) notFound();

  return <MdxComponent source={about.mdxSource} />;
};

export default AboutPage;

export const generateMetadata = async (): Promise<Metadata> => {
  return generatePageMetadata({ title: 'About', path: ROUTES.ABOUT });
};
