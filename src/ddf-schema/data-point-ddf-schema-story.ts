import {
  isEmpty,
  isEqual,
  difference,
  flatten,
  intersection,
  uniq
} from 'lodash';
import { Story } from './story';

function allPossibleCases(arr) {
  if (arr.length == 1) {
    return arr[0];
  }

  const result = [];
  const allCasesOfRest = allPossibleCases(arr.slice(1));

  for (let i = 0; i < allCasesOfRest.length; i++) {
    for (let j = 0; j < arr[0].length; j++) {
      result.push([arr[0][j], allCasesOfRest[i]]);
    }
  }
  return result;
}

export class DataPointDdfSchemaStory extends Story {
  private resources: string[] = [];
  private synonymCache = new Set();

  constructor(private parentmeaning: any, private dataPointResource: any) {
    super();

    this.meaning().datapoint = {};
  }

  public resume() {
    return this.meaning().datapoint;
  }

  public collectSynonymPrimaryKeysByRecord(record: any) {
    const synonymBasedPrimaryKeys = this.getSynonymPrimaryKeys(record, this.dataPointResource.schema.primaryKey);
    const synonymKey = synonymBasedPrimaryKeys.join('|');
    const bySameIndicator = (measures, resource) => {
      const fieldsFromResource = resource.schema.fields.map(field => field.name);
      const measuresFromResource = difference(fieldsFromResource, this.dataPointResource.schema.primaryKey);

      return !isEmpty(intersection(measuresFromResource, measures));
    };

    if (this.synonymCache.has(synonymKey)) {
      return;
    }

    const fields = this.dataPointResource.schema.fields.map(field => field.name);
    const measures = difference(fields, this.dataPointResource.schema.primaryKey);

    this.resources = this.getResourcesByPrimaryKeys(allPossibleCases(synonymBasedPrimaryKeys))
      .filter(resource => bySameIndicator(measures, resource)).map(resource => resource.name);
    this.resources.push(this.dataPointResource.name);
    this.synonymCache.add(synonymKey);

    return this;
  }

  public getSchema() {
    const fields = this.dataPointResource.schema.fields.map(field => field.name);
    const values = difference(fields, this.dataPointResource.schema.primaryKey);

    this.meaning().datapoint = [];

    for (let value of values) {
      this.meaning().datapoint.push({
        primaryKey: this.dataPointResource.schema.primaryKey,
        value,
        resources: uniq(this.resources)
      });
    }

    return this;
  }

  private getSynonymPrimaryKeys(record: any, primaryKey: string[]) {
    const synonymPrimaryKey = [];

    for (let part of primaryKey) {
      if (this.parentmeaning.entitiesValueHash[record[part]]) {
        const otherSynonymConcepts = difference(Array.from(this.parentmeaning.entitiesValueHash[record[part]].sets), [part]);

        synonymPrimaryKey.push(otherSynonymConcepts);
        continue;
      }

      synonymPrimaryKey.push([part]);
    }

    return synonymPrimaryKey;
  }

  private getResourcesByPrimaryKeys(allSynonymPrimaryKeys: string[][]) {
    const result = [];

    allSynonymPrimaryKeys.forEach(primaryKey => {
      const possiblePrimaryKeysViaDomain = this.getPossiblePrimaryKeysViaDomain(primaryKey);
      const primaryKeysContainPrimaryKey = (primaryKeys, primaryKey) => {
        for (let pk of primaryKeys) {
          if (isEqual(primaryKey, pk)) {
            return true;
          }
        }

        return false;
      };

      result.push(this.parentmeaning.dataPointResources.filter(resource =>
        primaryKeysContainPrimaryKey(possiblePrimaryKeysViaDomain, resource.schema.primaryKey.sort())));
    });

    return flatten(result);
  }

  private getPossiblePrimaryKeysViaDomain(primaryKey: string[]) {
    const result = [];

    for (let part of primaryKey) {
      if (this.parentmeaning.domainHash[part]) {
        result.push(this.parentmeaning.domainHash[part]);
        continue;
      }

      result.push(part);
    }

    return allPossibleCases([primaryKey, result]).map(primaryKey => primaryKey.sort());
  }
}
