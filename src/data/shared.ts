import * as path from 'path';
import { includes, isEmpty, isString, split, trim } from 'lodash';

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

export const getExcludedDirs = (settings: any) => {
  if (settings && settings.excludeDirs) {
    const excludeDirs = isString(settings.excludeDirs) ? split(settings.excludeDirs, ',') : settings.excludeDirs;

    return excludeDirs.map(dir => trim(dir.replace(/["']/g, '')));
  }

  return [];
};
