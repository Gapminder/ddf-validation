import { isArray, includes, compact } from 'lodash';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import { DATAPACKAGE_NONEXISTENT_CONCEPT } from '../registry';
import { DATA_PACKAGE_FILE } from '../../data/data-package';
import * as path from 'path';
import { CONCEPT_ID, CONCEPT_TYPE } from '../../ddf-definitions/constants';

const toArray = value => isArray(value) ? value : [value];
const fillConceptsSetBySchema = (dataPackageSchema, conceptsSet: Set<string>) => {
  [
    ...dataPackageSchema.concepts,
    ...dataPackageSchema.entities,
    ...dataPackageSchema.datapoints
  ].forEach(resource => {
    for (const pk of toArray(resource.primaryKey)) {
      conceptsSet.add(pk);
    }

    conceptsSet.add(resource.value);
  });
};
const fillResources = (ddfDataSet: DdfDataSet, conceptsSet: Set<string>) => {
  ddfDataSet.getDataPackageResources().forEach(resource => {
    for (const pk of toArray(resource.schema.primaryKey)) {
      conceptsSet.add(pk);
    }

    for (const field of resource.schema.fields) {
      conceptsSet.add(field.name);
    }
  });
};

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const dataPackagePath = path.resolve(ddfDataSet.dataPackageDescriptor.rootFolder, DATA_PACKAGE_FILE);
    const conceptsSet = new Set<string>();
    const dataPackageSchema = ddfDataSet.getDataPackageSchema();

    if (dataPackageSchema) {
      fillConceptsSetBySchema(dataPackageSchema, conceptsSet);
    }

    fillResources(ddfDataSet, conceptsSet);

    const originalConcepts = ddfDataSet.getConcept().getAllData().map(record => record.concept);

    return compact(Array.from(conceptsSet.values()))
      .map(concept => concept.replace(/^is--/, ''))
      .filter(concept => concept !== CONCEPT_ID && concept !== CONCEPT_TYPE && !includes(originalConcepts, concept))
      .map(concept => new Issue(DATAPACKAGE_NONEXISTENT_CONCEPT).setPath(dataPackagePath).setData(concept))
  }
};
