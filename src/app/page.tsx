import { redirect } from 'next/navigation';

import { ROUTES } from '@semantic/constants';

// Homepage sections (profile, playlist, updates) stripped per owner request —
// the homepage redirects to the posts listing.
const HomePage = () => {
  redirect(ROUTES.POSTS);
};

export default HomePage;
