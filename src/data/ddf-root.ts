import {startsWith, chain, split, isEmpty} from 'lodash';
import {sep} from 'path';
import {parallel} from 'async';
import {walkDir} from '../utils/file';
import {DirectoryDescriptor} from './directory-descriptor';

function isExcludedDirectory(currentDirectory, excludedDirectory) {
  return !isEmpty(split(currentDirectory, sep).filter(dir => dir === excludedDirectory));
}

function isHiddenDirectory(currentDirectory, settings): boolean {
  if (settings.isCheckHidden) {
    return false;
  }

  return !isEmpty(split(currentDirectory, sep)
    .filter(dir => dir !== '.' && startsWith(dir, '.') && !startsWith(dir, '..')));
}

export class DDFRoot {
  public path: string;
  public settings: any;
  public errors: Array<any>;
  public directoryDescriptors: Array<DirectoryDescriptor>;

  constructor(path, settings) {
    this.path = path;
    this.settings = settings || {};
    this.settings.excludeDirs = this.settings.excludeDirs || [];
    this.errors = [];
    this.directoryDescriptors = [];
  }

  getChecksMultiDir(dirs) {
    const actions = [];
    const defaultExcludes = ['etl'];

    dirs.concat(this.path).forEach(dir => {
      const isNotExcludedDirectory = !isHiddenDirectory(dir, this.settings) &&
        chain(defaultExcludes.concat(this.settings.excludeDirs))
          .map(excludedDir => isExcludedDirectory(dir, excludedDir))
          .compact()
          .isEmpty()
          .value();

      if (isNotExcludedDirectory) {
        actions.push(cb => {
          const directoryDescriptor = new DirectoryDescriptor(dir);

          directoryDescriptor.check(() => cb(null, directoryDescriptor));
        });
      }
    });

    return actions;
  }

  getChecksPathOnly() {
    return [
      cb => {
        const directoryDescriptor = new DirectoryDescriptor(this.path);

        directoryDescriptor.check(() => cb(null, directoryDescriptor));
      }
    ];
  }

  checkMultiDir(onMultiDirChecked) {
    walkDir(this.path, (err, dirs) => {
      if (err) {
        this.errors.push(err);
        onMultiDirChecked();
        return;
      }

      parallel(this.getChecksMultiDir(dirs), (checkErr: any, directoryDescriptors: Array<DirectoryDescriptor>) => {
        this.directoryDescriptors = directoryDescriptors;
        if (checkErr) {
          this.errors.push(checkErr);
        }

        onMultiDirChecked();
      });
    });
  }

  checkPathOnly(onPathChecked) {
    parallel(this.getChecksPathOnly(), (_err: any, directoryDescriptors: Array<DirectoryDescriptor>) => {
      this.directoryDescriptors = directoryDescriptors;
      if (_err) {
        this.errors.push(_err);
      }

      onPathChecked();
    });
  }

  check(onChecked) {
    if (this.settings.multiDirMode) {
      this.checkMultiDir(onChecked);
      return;
    }

    this.checkPathOnly(onChecked);
  }

  getDirectoriesDescriptors() {
    return this.directoryDescriptors.filter(desc => desc.isDDF);
  }
}
