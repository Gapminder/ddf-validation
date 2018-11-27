import * as path from 'path';
import { parallelLimit } from 'async';
import { compact, keys, includes } from 'lodash';
import { readFile } from '../utils/file';
import { getRelativePath } from './shared';
import { CONCEPT_TYPE_ENTITY_DOMAIN, CONCEPT_TYPE_ENTITY_SET, isDdfTrue, looksLikeIsField } from '../utils/ddf-things';
import {
  CONCEPT,
  DATA_POINT,
  ENTITY,
  getTypeByPrimaryKey,
  SYNONYM
} from '../ddf-definitions/constants';
import { getSettings } from '../utils/args';

const settings = getSettings();

function recursivePermutation(pkSets) {
  // end of recursion
  if (pkSets.length === 0) {
    return [[]];
  }

  // get one primary key field
  let pkSet = pkSets.pop();

  // get permutations for other primary key fields
  let prevPermutations = recursivePermutation(pkSets);

  let allPermutations = [];
  // each possible value of current primary key field
  for (let pkConcept of <Set<string>>pkSet) {
    // create new permutation by adding the current value on top of each previous permutation
    for (let prevPerm of prevPermutations) {
      let newPermutation = prevPerm.slice();
      newPermutation.push(pkConcept);
      allPermutations.push(newPermutation);
    }
  }
  return allPermutations;
}

function addToSchema(schema, resourceSchema) {
  const key = resourceSchema.primaryKey.sort().join('-');
  const hash = key + '--' + (resourceSchema.value || '-null-');

  if (!schema[hash]) {
    schema[hash] = {
      primaryKey: resourceSchema.primaryKey,
      value: resourceSchema.value,
      resources: new Set()
    };
  }
  schema[hash].resources.add(resourceSchema.resource)
}

export function getDdfSchemaContent(dataset: any, onDdfSchemaReady) {
  const entityConcepts = {};
  const conceptsContent = dataset.ddfDataSet.getConcept().getDataByFiles();
  const conceptsFiles = keys(conceptsContent);
  const entitiesContent = dataset.ddfDataSet.getEntity().getDataByFiles();
  const entitiesFiles = keys(entitiesContent);
  const synonymsContent = dataset.ddfDataSet.getSynonym().getDataByFiles();
  const synonymsFiles = keys(synonymsContent);
  const getProgressBar = (config: any): any => settings.isDataPackageGenerationMode && !settings.silent ?
    require('terminal-kit').terminal.progressBar(config) : {
      startItem: () => {
      },
      itemDone: () => {
      }
    };

  dataset.dataHash = {};

  for (let conceptFile of conceptsFiles) {
    const relativePath = getRelativePath(conceptFile, dataset.dataPackageDescriptor.rootFolder);

    dataset.dataHash[relativePath] = conceptsContent[conceptFile];
  }

  for (let synonymFile of synonymsFiles) {
    const relativePath = getRelativePath(synonymFile, dataset.dataPackageDescriptor.rootFolder);

    dataset.dataHash[relativePath] = synonymsContent[synonymFile];
  }

  for (let entityFile of entitiesFiles) {
    const relativePath = getRelativePath(entityFile, dataset.dataPackageDescriptor.rootFolder);

    dataset.dataHash[relativePath] = entitiesContent[entityFile];
  }

  // PREPARE

  // fetch entity domain and entity set concepts
  for (let resource of dataset.conceptsResources) {
    if (!dataset.dataHash[resource.path]) {
      return onDdfSchemaReady(new Error(`ddfSchema creation error: key=${resource.path}`));
    }

    for (let row of dataset.dataHash[resource.path]) {
      if (row.concept_type === CONCEPT_TYPE_ENTITY_DOMAIN || row.concept_type === CONCEPT_TYPE_ENTITY_SET) {
        entityConcepts[row.concept] = row; // entities['geo'] = { concept: "geo", concept_type: "entity_domain", ... }
      }
    }
  }

  const entities = {};

  // fetch set-membership details for every single entity in dataset
  for (let resource of dataset.entitiesResources) {

    // find the domain of this entity resource

    const pk = resource.schema.primaryKey[0];

    if (!entityConcepts[pk]) {
      return onDdfSchemaReady(`Validator internal error: entity concept not found`);
    }

    const domain = (entityConcepts[pk].concept_type == CONCEPT_TYPE_ENTITY_DOMAIN) ? pk : entityConcepts[pk].domain;

    // find sets defined in this resource
    const entity_set_fields = [];

    for (let field of resource.schema['fields']) {
      if (looksLikeIsField(field)) {
        entity_set_fields.push(field);
      }
    }

    // get set membership per entity in this resource
    if (!dataset.dataHash[resource.path]) {
      return onDdfSchemaReady(new Error(`ddfSchema creation error: key=${resource.path}`));
    }

    for (let row of dataset.dataHash[resource.path]) {
      if (!entities[domain]) {
        entities[domain] = {};
      }

      if (!entities[domain][row[pk]]) {
        entities[domain][row[pk]] = new Set();
      }

      entities[domain][row[pk]].add(domain);

      for (let field of entity_set_fields) {
        if (isDdfTrue(row[field])) {
          entities[domain][row[pk]].add(field.substring(4));
        }
      }
    }

    // final format example
    // entities['geo']['usa'] = { geo, country, unstate }
    // entities['geo']['hkg'] = { geo, country, city }
    // entities['geo']['america'] = { geo, world_4region }
    // entities['gender']['male'] = { gender }
    // entities['gender']['female'] = { gender }
  }

  // GENERATE SCHEMA IN DICTIONARY

  const schema = {};

  const tasks = dataset.resources.map(resource => resource.name);
  const progressBar = getProgressBar({
    width: 80,
    title: 'resources hash processing:',
    eta: true,
    percent: true,
    items: tasks.length
  });


  const actions = dataset.resources.map(resource => onResourceProcessed => {
    const task = tasks.shift();

    progressBar.startItem(task);

    readFile(path.resolve(dataset.dataPackageDescriptor.rootFolder, resource.path), (err, dataPointContent) => {
      if (err) {
        onResourceProcessed(err);
        return;
      }

      // OPTIMIZATION
      let primaryKeyEntityConcepts = [];
      let primaryKeySetsStatic = [];

      // get all entity headers for entities in primary key
      for (let pkField of resource.schema.primaryKey) {
        // save the concept if it's a entity concept
        if (entityConcepts[pkField]) {
          // find the domain of this entity concept (for lookup in the entities object)
          const domain = entityConcepts[pkField].concept_type == CONCEPT_TYPE_ENTITY_DOMAIN ? pkField : entityConcepts[pkField].domain;

          primaryKeyEntityConcepts.push({concept: pkField, domain: domain});
        } else {
          primaryKeySetsStatic.push(new Set([pkField]));
        }
      }

      if (primaryKeyEntityConcepts.length == 0) {
        // no entity concepts found, no need to take entity multi-set membership into account

        // special case when file only contains key column
        if (resource.schema.primaryKey.length == resource.schema.fields.length) {
          addToSchema(schema, {
            primaryKey: resource.schema.primaryKey,
            value: null,
            resource: resource.name
          });
        } else {
          for (let field of resource.schema.fields) {
            if (!includes(resource.schema.primaryKey, field)) {
              addToSchema(schema, {
                primaryKey: resource.schema.primaryKey,
                value: field,
                resource: resource.name
              });
            }
          }
        }

        // END OPTIMIZATION

      } else {
        // analyse every row to find what key-value pairs apply to it (can be multiple because an entity can be member in multiple entity sets)
        for (let row of dataPointContent) {

          const primaryKeySets = primaryKeySetsStatic.slice();

          // get all entity headers for entities in primary key
          for (const pkEntityConcept of primaryKeyEntityConcepts) {
            primaryKeySets.push(entities[pkEntityConcept.domain][row[pkEntityConcept.concept]]);
          }

          // find all permutations of primary key
          const primaryKeyPermutations = recursivePermutation(compact(primaryKeySets));

          // add a key-value pair to the schema for each schema this row fits to

          // special case when file only contains key column
          if (resource.schema.primaryKey.length == resource.schema.fields.length) {
            for (let pkPerm of primaryKeyPermutations) {
              addToSchema(schema, {
                primaryKey: pkPerm,
                value: null,
                resource: resource.name
              });
            }
          } else {
            for (let field of resource.schema.fields) {
              if (!resource.schema.primaryKey.includes(field))
                for (let pkPerm of primaryKeyPermutations) {
                  addToSchema(schema, {
                    primaryKey: pkPerm,
                    value: field,
                    resource: resource.name
                  });
                }
            }
          }
        }
      }

      progressBar.itemDone();

      onResourceProcessed();
    });
  });

  parallelLimit(actions, 10, (err) => {
    const ddfSchema = {datapoints: [], entities: [], concepts: [], synonyms: []};

    for (let key of keys(schema)) {
      const keyValueObject = schema[key];
      const type = getTypeByPrimaryKey(keyValueObject.primaryKey);

      keyValueObject.resources = Array.from(keyValueObject.resources);

      switch (type) {
        case CONCEPT:
          ddfSchema.concepts.push(keyValueObject);
          break;
        case ENTITY:
          ddfSchema.entities.push(keyValueObject);
          break;
        case SYNONYM:
          ddfSchema.synonyms.push(keyValueObject);
          break;
        case DATA_POINT:
          ddfSchema.datapoints.push(keyValueObject);
          break;
        default:
          break;
      }
    }

    onDdfSchemaReady(err, ddfSchema);
  });
}
