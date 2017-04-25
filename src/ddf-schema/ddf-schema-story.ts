import * as path from 'path';
import { parallelLimit } from 'async';
import {
  reduce,
  keys,
  concat,
  isArray,
  isEmpty
} from 'lodash';
import { DataPackage } from '../data/data-package';
import { DdfDataSet } from '../ddf-definitions/ddf-data-set';
import { Story } from './story';
import { DataPointDdfSchemaStory } from './data-point-ddf-schema-story';
import { EntityValuesHashStory } from './entity-values-hash-story';

export class DdfSchemaStory extends Story {
  constructor(private ddfDataSet: DdfDataSet, private dataPackageDescriptor: DataPackage) {
    super();
  }

  public resume() {
    return {
      concepts: this.meaning().concepts,
      entities: this.meaning().entities,
      datapoints: this.meaning().datapoints
    };
  }

  public getDomainHash() {
    if (!isEmpty(this.meaning().domainHash)) {
      return this;
    }

    const conceptsData = this.ddfDataSet.getConcept().getAllData();

    this.meaning().domainHash = reduce(conceptsData, (result: any, entityRecord: any) => {
      if (entityRecord.concept_type === 'entity_set') {
        result[entityRecord.concept] = entityRecord.domain;
      }

      return result;
    }, {});

    return this;
  }

  public getEntitiesDataByFiles() {
    if (!isEmpty(this.meaning().entitiesDataByFiles)) {
      return this;
    }

    this.meaning().entitiesDataByFiles = this.ddfDataSet.getEntity().getDataByFiles();

    return this;
  }

  public fillEntitiesValueHash() {
    if (!isEmpty(this.meaning().entitiesValueHash)) {
      return this;
    }

    const valuesHashStory = new EntityValuesHashStory(this.dataPackageDescriptor.dataPackage, this.meaning().entitiesDataByFiles);

    this.meaning().entitiesValueHash = valuesHashStory.getResourceNames().getPrimaryKeysByEachResourceName().fillHashByPrimaryKeys().resume();

    return this;
  }

  public getDataPointsResources() {
    this.meaning().dataPointResources = this.dataPackageDescriptor.getResources()
      .filter(resource => resource.schema.primaryKey.length > 1 && isArray(resource.schema.primaryKey));

    return this;
  }

  public waitForDataPointSchema(onDataPointsProcessed: Function) {
    this.meaning().datapoints = [];
    const actions = this.meaning().dataPointResources.map((dataPointResource: any) => (onDataPointProcessed: Function) => {
      const fullPath = path.resolve(this.dataPackageDescriptor.rootFolder, dataPointResource.path);
      const dataPointDdfSchemaStory = new DataPointDdfSchemaStory(this.meaning(), dataPointResource);

      this.ddfDataSet.getDataPoint().loadFile({fullPath},
        (record: any) => {
          dataPointDdfSchemaStory.collectSynonymPrimaryKeysByRecord(record);
        },
        (err: any) => {
          this.meaning().datapoints = concat(this.meaning().datapoints, dataPointDdfSchemaStory.getSchema().resume());
          onDataPointProcessed(err);
        });
    });

    parallelLimit(actions, 10, (err: any) => {
      onDataPointsProcessed(err);
    });
  }

  public fillEntityResourceHash() {
    this.meaning().entityResources = this.dataPackageDescriptor.getResources()
      .filter(resource => !isArray(resource.schema.primaryKey) && resource.schema.primaryKey !== 'concept');
    this.meaning().entityResourceHash = reduce(this.meaning().entityResources, (result: any, resource: any) => {
      result[resource.name] = resource;

      return result;
    }, {});

    return this;
  }

  public getEntitiesSchema() {
    this.meaning().entities = [];

    const entityFiles = keys(this.meaning().entitiesDataByFiles);

    entityFiles.forEach(filePath => {
      const fileName = path.parse(filePath).name;
      const resource = this.meaning().entityResourceHash[fileName];
      const content = this.meaning().entitiesDataByFiles[filePath];
      const resources = new Set();

      content.forEach(record => {
        const primaryKeyValue = record[resource.schema.primaryKey];

        for (let fileName of this.meaning().entitiesValueHash[primaryKeyValue].files) {
          resources.add(path.parse(fileName).name);
        }
      });

      for (let field of resource.schema.fields) {
        if (field !== resource.schema.primaryKey) {
          this.meaning().entities.push({
            primaryKey: [resource.schema.primaryKey],
            value: field,
            resources: Array.from(resources)
          });
        }
      }
    });

    return this;
  }

  public getConceptsFieldsHash() {
    const resources: any[] = this.dataPackageDescriptor.getResources().filter(resource => resource.schema.primaryKey === 'concept');

    this.meaning().conceptsFieldsHash = {};

    for (let resource of resources) {
      for (let field of resource.schema.fields) {
        if (field.name !== 'concept') {
          if (!this.meaning().conceptsFieldsHash[field.name]) {
            this.meaning().conceptsFieldsHash[field.name] = new Set();
          }

          this.meaning().conceptsFieldsHash[field.name].add(resource.name);
        }
      }
    }

    return this;
  }

  public getConceptsSchema() {
    this.meaning().concepts = [];

    const fields = keys(this.meaning().conceptsFieldsHash);

    for (let field of fields) {
      this.meaning().concepts.push({
        primaryKey: ['concept'],
        value: field,
        resources: Array.from(this.meaning().conceptsFieldsHash[field])
      });
    }

    return this;
  }
}