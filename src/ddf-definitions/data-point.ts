import { walkFile, readFile as _readFile } from '../utils/file';
import { FileDescriptor } from '../data/file-descriptor';
import { DataPackage } from '../data/data-package';

export class DataPoint {
  public fileDescriptors: FileDescriptor[];
  public dataPackageObjects: DataPackage[];

  constructor() {
    this.fileDescriptors = [];
    this.dataPackageObjects = [];
  }

  addDescriptors(fileDescriptor: FileDescriptor, dataPackageObject: DataPackage) {
    this.fileDescriptors.push(fileDescriptor);
    this.dataPackageObjects.push(dataPackageObject);
  }

  loadFile(fileDescriptor: FileDescriptor, onLineRead: Function, onFileRead: Function) {
    walkFile(fileDescriptor.fullPath, onLineRead, onFileRead);
  }

  readFile(filename: string, onFileRead: Function) {
    _readFile(filename, onFileRead);
  }
}
