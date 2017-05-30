import * as path from 'path';
import { includes, isEmpty } from 'lodash';

export const isPathExpected = (folderPath: string, externalExcludedFolders: string[] = []): boolean => {
  const folders = folderPath.split(path.sep);

  if (includes(folders, '.git') || includes(folders, 'etl') || includes(folders, 'lang')) {
    return false;
  }

  if (!isEmpty(folders.filter(folder => includes(externalExcludedFolders, folder)))) {
    return false;
  }

  return true;
};

export const getRelativePath = (fullFolderPath: string, rootFolder: string): string =>
  path.relative(rootFolder, fullFolderPath);
