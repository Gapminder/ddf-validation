import { compact, concat, flattenDeep, isEmpty } from 'lodash';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { FileDescriptor } from '../../data/file-descriptor';
import { Issue } from '../issue';
import { INCORRECT_FILE } from '../../ddf-rules/registry';

const NON_PRINTABLE_CHARACTERS_REGEXP = /[\x00-\x1F]+/g;
const getSuggestions = (filename: string): string[] => [filename.replace(NON_PRINTABLE_CHARACTERS_REGEXP, '')];
const getIssuesByFileDescriptors = (ddfDataSet: DdfDataSet): Issue[] => {
  const result: any[] = ddfDataSet.ddfRoot.fileDescriptors
    .filter((fileDescriptor: FileDescriptor) => !isEmpty(fileDescriptor.issues))
    .map((fileDescriptor: FileDescriptor) => fileDescriptor.issues.map(issue =>
      new Issue(issue.type).setPath(issue.path).setData(issue.data)));

  return compact(flattenDeep(result));
};
const getIssuesByDataPackage = (ddfDataSet: DdfDataSet): Issue[] => {
  const dataPackageDescriptor = ddfDataSet.ddfRoot.dataPackageDescriptor;
  const result: any[] = dataPackageDescriptor.fileDescriptors
    .filter((fileDescriptor: any) => NON_PRINTABLE_CHARACTERS_REGEXP.test(fileDescriptor.fullPath))
    .map((fileDescriptor: any) => new Issue(INCORRECT_FILE)
      .setPath(fileDescriptor.fullPath)
      .setData({reason: 'Non printable characters in filename'})
      .setSuggestions(getSuggestions(fileDescriptor.fullPath)));

  return compact(flattenDeep(result));
};

export const rule = {
  rule: (ddfDataSet: DdfDataSet): Issue[] =>
    concat(getIssuesByFileDescriptors(ddfDataSet), getIssuesByDataPackage(ddfDataSet))
};
