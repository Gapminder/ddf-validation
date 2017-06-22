import { getExcludedDirs } from './shared';
import { isEmpty, isArray } from 'lodash';
import { parallelLimit } from 'async';
import { resolve } from 'path';
import { TRNSLATIONS_FOLDER } from '../ddf-definitions/constants';
import { DataPackage } from './data-package';
import { FileDescriptor } from './file-descriptor';

const PROCESS_LIMIT = 30;

export class DDFRoot {
  public path: string;
  public settings: any;
  public errors: any[];
  public ignoreExistingDataPackage: boolean;
  public dataPackageDescriptor: DataPackage;
  public isEmpty: boolean;
  public isDDF: boolean;
  public fileDescriptors: FileDescriptor[];


  constructor(path, settings, ignoreExistingDataPackage: boolean = false) {
    this.path = path;
    this.settings = settings || {};
    this.settings.excludeDirs = getExcludedDirs(this.settings);
    this.errors = [];
    this.ignoreExistingDataPackage = ignoreExistingDataPackage;
    this.isEmpty = false;
    this.isDDF = true;
    this.fileDescriptors = [];
  }

  getTranslations(onTranslationsReady) {
    if (isEmpty(this.dataPackageDescriptor.getTranslations())) {
      onTranslationsReady();
      return;
    }

    const translationsIds = this.dataPackageDescriptor.getTranslations().map(translation => translation.id);

    this.fileDescriptors.forEach(fileDescriptor => {
      const translationFolder = resolve(this.path, TRNSLATIONS_FOLDER);

      fileDescriptor.transFileDescriptors = translationsIds
        .map(translationsId =>
          new FileDescriptor({
            dir: resolve(translationFolder, translationsId),
            file: fileDescriptor.file,
            type: fileDescriptor.type,
            primaryKey: fileDescriptor.primaryKey,
            fullPath: resolve(translationFolder, translationsId, fileDescriptor.file),
            isTranslation: true
          }));
    });

    const transFileActions = this.fileDescriptors
      .map(fileDescriptor =>
        onTransFileReady =>
          fileDescriptor.checkTranslations(onTransFileReady));

    parallelLimit(transFileActions, PROCESS_LIMIT, onTranslationsReady);
  }

  check(onDirectoryDescriptorReady: Function) {
    this.dataPackageDescriptor = new DataPackage(this.path, this.settings);
    this.dataPackageDescriptor.take(dataPackageObject => {
      if (!this.dataPackageDescriptor.isValid() || isEmpty(this.dataPackageDescriptor.fileDescriptors)) {
        this.isDDF = false;
        onDirectoryDescriptorReady();
        return;
      }

      const expectedResources = !this.settings.datapointlessMode ? dataPackageObject.resources :
        dataPackageObject.resources.filter(ddfResource => !isArray(ddfResource.schema.primaryKey));

      this.fileDescriptors = expectedResources.map(ddfResource => this.getFileDescriptor(this.path, ddfResource));

      const actionsCsv = this.fileDescriptors.map(fileDescriptor => onFileChecked =>
        fileDescriptor.csvChecker.check(onFileChecked));
      const actionsForDescriptor = this.fileDescriptors.map(fileDescriptor =>
        onFileChecked => fileDescriptor.check(onFileChecked));

      parallelLimit(
        actionsCsv.concat(actionsForDescriptor),
        PROCESS_LIMIT,
        checkErr => {
          if (checkErr) {
            onDirectoryDescriptorReady(checkErr);
            return;
          }

          this.getTranslations(onDirectoryDescriptorReady);
        }
      );
    }, this.ignoreExistingDataPackage);
  }

  getFileDescriptor(dir, ddfResource) {
    return new FileDescriptor({
      dir,
      file: ddfResource.path,
      type: this.dataPackageDescriptor.getType(ddfResource.path),
      headers: ddfResource.schema.fields,
      primaryKey: ddfResource.schema.primaryKey,
      fullPath: resolve(dir, ddfResource.path)
    });
  }

  getDataPackageResources() {
    return this.dataPackageDescriptor.getResources();
  }
}
