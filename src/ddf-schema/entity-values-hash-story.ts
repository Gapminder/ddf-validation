import * as path from 'path';
import { keys } from 'lodash';
import { Story } from './story';

const getNameByFile = (fileName: string): string => {
  return path.parse(fileName).name;
};

export class EntityValuesHashStory extends Story {
  constructor(private dataPackage: any, private entitiesDataByFiles: any) {
    super();
  }

  public resume() {
    return this.meaning().entityValueHash;
  }

  public getResourceNames() {
    this.meaning().resourceFiles = keys(this.entitiesDataByFiles);
    this.meaning().resourceNames = this.meaning().resourceFiles.map(fileName => getNameByFile(fileName));

    return this;
  }

  public getPrimaryKeysByEachResourceName() {
    this.meaning().primaryKeyHash = {};
    this.meaning().resourceNames.forEach((resourceName: string) => {
      const resource = this.dataPackage.resources.find(resource => resource.name === resourceName);

      this.meaning().primaryKeyHash[resourceName] = resource.schema.primaryKey;
    });

    return this;
  }

  public fillHashByPrimaryKeys() {
    this.meaning().entityValueHash = {};
    this.meaning().resourceFiles.forEach((fileName: any) => {
      this.entitiesDataByFiles[fileName].forEach((record: any) => {
        const resourceName = getNameByFile(fileName);
        const primaryKey = this.meaning().primaryKeyHash[resourceName];

        if (!this.meaning().entityValueHash[record[primaryKey]]) {
          this.meaning().entityValueHash[record[primaryKey]] = {
            files: new Set(),
            sets: new Set()
          };
        }

        this.meaning().entityValueHash[record[primaryKey]].files.add(fileName);
        this.meaning().entityValueHash[record[primaryKey]].sets.add(primaryKey);
      });
    });

    return this;
  }
}
