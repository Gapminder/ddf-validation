import {
  compact,
  head,
  startsWith,
  endsWith
} from 'lodash';
import { NON_UNIQUE_ENTITY_VALUE } from '../../registry';
import { DdfDataSet } from '../../../ddf-definitions/ddf-data-set';
import { Issue } from '../../issue';

const isEntityDomainField = (conceptTypes, field) => conceptTypes[field] === 'entity_domain';
const isEntitySetField = (conceptTypes, field) => conceptTypes[field] === 'entity_set';
const isFieldRelatedToEntity = field => startsWith(field, 'is--');

class EntityFileDescriptor {
  constructor(public entitySetFields: string[], public entityIdField: string) {
  }

  getRelatedEntities(record): string[] {
    const relatedEntities = [];

    for (let entitySetField of this.entitySetFields) {
      if (record[entitySetField] === 'TRUE' || record[entitySetField] === 'true') {
        relatedEntities.push(entitySetField.replace(/is--/, ''));
      }
    }

    return relatedEntities;
  }
}

class DuplicationDescriptor {
  constructor(public relatedEntities: string[], public record) {
  }
}

export class SearchUniqueEntitiesStory {
  private ddfDataSet: DdfDataSet;
  private serviceData;
  private dutyData;

  constructor(ddfDataSet: DdfDataSet) {
    this.ddfDataSet = ddfDataSet;
    this.serviceData = {};
    this.dutyData = {};
  }

  fillServiceData(): SearchUniqueEntitiesStory {
    this.serviceData.conceptTypeHash = this.ddfDataSet.getConcept().getDictionary(null, 'concept_type');
    this.serviceData.domainTypeHash = this.ddfDataSet.getConcept().getDictionary(null, 'domain');
    this.serviceData.entities = this.ddfDataSet.getEntity().getDataByFiles();
    this.serviceData.entityFiles = Object.keys(this.serviceData.entities);

    return this;
  }

  collectFieldDescriptors(): SearchUniqueEntitiesStory {
    this.serviceData.entityFileDescriptors = {};

    for (let entityFile of this.serviceData.entityFiles) {
      const firstRecord = head(this.serviceData.entities[entityFile]);
      const allFields = Object.keys(firstRecord);
      const entitySetFields = [];
      const dataPackageResource: any = head(this.ddfDataSet.ddfRoot.getDataPackageResources()
        .filter(resource => endsWith(entityFile, resource.path)));
      const entityIdField = dataPackageResource.schema.primaryKey;

      for (let field of allFields) {
        if (isFieldRelatedToEntity(field)) {
          entitySetFields.push(field);
        }
      }

      this.serviceData.entityFileDescriptors[entityFile] = new EntityFileDescriptor(entitySetFields, entityIdField);
    }

    return this;
  }

  collectValueCounters(): SearchUniqueEntitiesStory {
    this.dutyData.valueCounters = {};

    for (let entityFile of this.serviceData.entityFiles) {
      const entityFileDescriptor = this.serviceData.entityFileDescriptors[entityFile];

      for (let record of this.serviceData.entities[entityFile]) {
        const value = record[entityFileDescriptor.entityIdField];

        if (!this.dutyData.valueCounters[value]) {
          this.dutyData.valueCounters[value] = 0;
        }

        this.dutyData.valueCounters[value]++;
      }
    }

    return this;
  }

  collectValueDuplicationDescriptors(): SearchUniqueEntitiesStory {
    this.dutyData.duplicationDescriptors = {};

    for (let entityFile of this.serviceData.entityFiles) {
      const entityFileDescriptor = this.serviceData.entityFileDescriptors[entityFile];

      for (let record of this.serviceData.entities[entityFile]) {
        const value = record[entityFileDescriptor.entityIdField];

        if (this.dutyData.valueCounters[value] > 1) {
          const relatedEntities = [];

          if (isEntityDomainField(this.serviceData.conceptTypeHash, entityFileDescriptor.entityIdField)) {
            relatedEntities.push(...entityFileDescriptor.getRelatedEntities(record));
            relatedEntities.push(...this.getEntitySetFieldsForDomain(record, entityFileDescriptor.entityIdField));
          }

          if (isEntitySetField(this.serviceData.conceptTypeHash, entityFileDescriptor.entityIdField)) {
            relatedEntities.push(entityFileDescriptor.entityIdField);
          }

          if (!this.dutyData.duplicationDescriptors[value]) {
            this.dutyData.duplicationDescriptors[value] = [];
          }

          this.dutyData.duplicationDescriptors[value].push(new DuplicationDescriptor(relatedEntities, record));
        }
      }
    }

    return this;
  }

  countDuplicationsByEntitySets(): SearchUniqueEntitiesStory {
    this.dutyData.entitiesCounters = {};

    const values = Object.keys(this.dutyData.duplicationDescriptors);

    for (let value of values) {
      const entitiesCounters = {};

      for (let duplicationDescriptor of this.dutyData.duplicationDescriptors[value]) {
        for (let relatedEntity of duplicationDescriptor.relatedEntities) {
          if (!entitiesCounters[relatedEntity]) {
            entitiesCounters[relatedEntity] = 0;
          }

          entitiesCounters[relatedEntity]++;
        }
      }

      this.dutyData.entitiesCounters[value] = entitiesCounters;
    }

    return this;
  }

  result(): any[] {
    const issues = [];
    const values = Object.keys(this.dutyData.duplicationDescriptors);
    const isDuplication = (value: string, relatedEntities: string[]): boolean => {
      for (let relatedEntity of relatedEntities) {
        if (this.dutyData.entitiesCounters[value][relatedEntity] > 1) {
          return true;
        }
      }

      return false;
    };

    for (let value of values) {
      let issue: Issue = null;

      for (let duplicationDescriptor of this.dutyData.duplicationDescriptors[value]) {
        if (isDuplication(value, duplicationDescriptor.relatedEntities)) {
          if (!issue) {
            issue = new Issue(NON_UNIQUE_ENTITY_VALUE).setData({value, records: []});
          }

          issue.data.records.push(duplicationDescriptor.record);
        }
      }

      issues.push(issue);
    }

    return compact(issues);
  }

  private getEntitySetFieldsForDomain(firstRecord, entityIdField: string): string[] {
    const entitySetFields = [];
    const allFields = Object.keys(firstRecord);

    let doesNotContainIsFields = true;

    for (let field of allFields) {
      if (isFieldRelatedToEntity(field)) {
        doesNotContainIsFields = false;
      }
    }

    if (doesNotContainIsFields) {
      for (let key of Object.keys(this.serviceData.domainTypeHash)) {
        if (entityIdField === this.serviceData.domainTypeHash[key]) {
          entitySetFields.push(key);
        }
      }
    }

    return entitySetFields;
  }
}
