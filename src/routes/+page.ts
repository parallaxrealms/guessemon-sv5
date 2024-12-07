import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
  const modeValue = parseInt(url.searchParams.get('mode') || '0');

  return {
    modeValue,
  };
};
