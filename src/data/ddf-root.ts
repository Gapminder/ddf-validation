import { parallel } from 'async';
import { walkDir } from '../utils/file';
import { DirectoryDescriptor } from './directory-descriptor';
import { isPathExpected } from './shared';

export class DDFRoot {
  public path: string;
  public settings: any;
  public errors: any[];
  public directoryDescriptors: DirectoryDescriptor[];

  constructor(path, settings) {
    this.path = path;
    this.settings = settings || {};
    this.settings.excludeDirs = this.settings.excludeDirs || [];
    this.errors = [];
    this.directoryDescriptors = [];
  }

  getChecksMultiDir(dirs) {
    const actions = [];

    dirs.concat(this.path).forEach(dir => {
      const isNotExcludedDirectory = isPathExpected(dir, this.settings.excludeDirs);

      if (isNotExcludedDirectory) {
        actions.push(cb => {
          const directoryDescriptor = new DirectoryDescriptor(dir);

          directoryDescriptor.check(() => cb(null, directoryDescriptor));
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
        this.directoryDescriptors = directoryDescriptors;
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
