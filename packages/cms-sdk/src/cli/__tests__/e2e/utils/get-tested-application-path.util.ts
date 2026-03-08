import path from 'path';

export const getTestedApplicationPath = (relativePath: string): string => {
  const cmsAppsPath = path.resolve(
    __dirname,
    '../../../../../../cms-apps',
  );

  return path.join(cmsAppsPath, relativePath);
};
