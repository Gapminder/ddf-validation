import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {DirectoryDescriptor} from '../../data/directory-descriptor';

export const getNonDdfDirectoryDescriptors = (ddfData: DdfDataSet) =>
  ddfData.ddfRoot.directoryDescriptors
    .filter((directoryDescriptor: DirectoryDescriptor) => !directoryDescriptor.isDDF);
