import {walkFile} from '../utils/file';
import {FileDescriptor} from '../data/file-descriptor';

export class DataPoint {
  public fileDescriptors: Array<FileDescriptor>;

  constructor() {
    this.fileDescriptors = [];
  }

  addFileDescriptor(fileDescriptor) {
    this.fileDescriptors.push(fileDescriptor);
  }

  loadFile(fileDescriptor, onLineRead, onFileRead) {
    walkFile(fileDescriptor.fullPath, onLineRead, onFileRead);
  }
}
