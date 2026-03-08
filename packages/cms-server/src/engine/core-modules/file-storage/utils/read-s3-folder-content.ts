import { isDefined } from 'cms-shared/utils';
import { isObject } from '@sniptt/guards';
import { type Sources } from 'cms-shared/types';

export const readS3FolderContent = (
  files: { path: string; fileContent: string }[],
) => {
  const result: Sources = {};

  for (const { path, fileContent } of files) {
    const segments = path.split('/');
    const fileName = segments.pop();

    if (!isDefined(fileName)) {
      continue;
    }

    let cursor: Sources = result;

    for (const segment of segments) {
      if (!isObject(cursor[segment])) {
        cursor[segment] = {};
      }
      cursor = cursor[segment] as Sources;
    }

    cursor[fileName] = fileContent;
  }

  return result;
};
