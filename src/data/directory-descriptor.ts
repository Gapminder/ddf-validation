import { isEmpty } from 'lodash';
import { parallelLimit } from 'async';
import { resolve } from 'path';
import { TRNSLATIONS_FOLDER } from '../ddf-definitions/constants';
import { DataPackage } from '../data/data-package';
import { FileDescriptor } from './file-descriptor';

const PROCESS_LIMIT = 5;

export class DirectoryDescriptor {
  public dataPackage: DataPackage;
  public dir: string;
  public settings: any;
  public isEmpty: boolean;
  public isDDF: boolean;
  public fileDescriptors: FileDescriptor[];
  public errors: any[];

  constructor(dir: string, settings: any) {
    this.dir = dir;
    this.isEmpty = false;
    this.isDDF = true;
    this.fileDescriptors = [];
    this.settings = settings;
    this.errors = [];
  }

  getTranslations(onTranslationsReady) {
    if (isEmpty(this.dataPackage.getTranslations())) {
      onTranslationsReady();
      return;
    }

    const translationsIds = this.dataPackage.getTranslations().map(translation => translation.id);

    this.fileDescriptors.forEach(fileDescriptor => {
      const translationFolder = resolve(this.dir, TRNSLATIONS_FOLDER);

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

  check(ignoreExistingDataPackage: boolean = false, onDirectoryDescriptorReady: Function) {
    this.dataPackage = new DataPackage(this.dir, this.settings);
    this.dataPackage.take(dataPackageObject => {
      if (!this.dataPackage.isValid() || isEmpty(this.dataPackage.fileDescriptors)) {
        this.isDDF = false;
        onDirectoryDescriptorReady();
        return;
      }

      this.fileDescriptors = dataPackageObject.resources.map(ddfResource =>
        this.getFileDescriptor(this.dir, ddfResource));

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
    }, ignoreExistingDataPackage);
  }

  getFileDescriptor(dir, ddfResource) {
    return new FileDescriptor({
      dir,
      file: ddfResource.path,
      type: this.dataPackage.getType(ddfResource.path),
      headers: ddfResource.schema.fields,
      primaryKey: ddfResource.schema.primaryKey,
      fullPath: resolve(dir, ddfResource.path)
    });
  }
}
