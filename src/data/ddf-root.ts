import { parallel } from 'async';
import { isEmpty } from 'lodash';
import { walkDir } from '../utils/file';
import { DirectoryDescriptor } from './directory-descriptor';
import { getExcludedDirs, isPathExpected } from './shared';

export class DDFRoot {
  public path: string;
  public settings: any;
  public errors: any[];
  public directoryDescriptors: DirectoryDescriptor[];
  public ignoreExistingDataPackage: boolean;

  constructor(path, settings, ignoreExistingDataPackage: boolean = false) {
    this.path = path;
    this.settings = settings || {};
    this.settings.excludeDirs = getExcludedDirs(this.settings);
    this.errors = [];
    this.directoryDescriptors = [];
    this.ignoreExistingDataPackage = ignoreExistingDataPackage;
  }

  getChecksMultiDir(dirs) {
    const actions = [];

    dirs.concat(this.path).forEach(dir => {
      const isNotExcludedDirectory = isPathExpected(dir, this.settings.excludeDirs);

      if (isNotExcludedDirectory) {
        actions.push(cb => {
          const directoryDescriptor = new DirectoryDescriptor(dir, this.settings);

          directoryDescriptor.check(this.ignoreExistingDataPackage, () => cb(null, directoryDescriptor));
        });
      }
    });

    return actions;
  }

  checkMultiDir(onMultiDirChecked) {
    walkDir(this.path, (err, dirs) => {
      if (err) {
        this.errors.push(err);
        onMultiDirChecked();
        return;
      }

      parallel(this.getChecksMultiDir(dirs), (checkErr: any, directoryDescriptors: DirectoryDescriptor[]) => {
        this.directoryDescriptors = directoryDescriptors.map(directoryDescriptor => {
          const badFileDescriptors = directoryDescriptor.fileDescriptors.filter(fileDescriptor => !isEmpty(fileDescriptor.issues));

          if (badFileDescriptors.length === directoryDescriptor.fileDescriptors.length) {
            directoryDescriptor.isDDF = false;
          }

          return directoryDescriptor;
        });

        if (checkErr) {
          this.errors.push(checkErr);
        }

        onMultiDirChecked();
      });
    });
  }

  check(onChecked) {
    this.checkMultiDir(onChecked);
  }

  getDirectoriesDescriptors() {
    return this.directoryDescriptors.filter(desc => desc.isDDF);
  }
}
