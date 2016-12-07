import {isArray, compact, flattenDeep, includes, isEmpty} from 'lodash';
import {resolve} from 'path';
import {DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY} from '../registry';
import {PREDEFINED_CONCEPTS} from '../../ddf-definitions/constants';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

function getArrayInAnyCase(value) {
  if (!isArray(value)) {
    return [value];
  }

  return value;
}

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => compact(flattenDeep(
    ddfDataSet.ddfRoot.directoryDescriptors.map(directoryDescriptor =>
      directoryDescriptor.dataPackage.getResources().map(resource => {
        const dataPackagePrimaryKey = getArrayInAnyCase(resource.schema.primaryKey);
        const allConceptsIds = ddfDataSet.getConcept().getIds().concat(PREDEFINED_CONCEPTS);
        const nonConcepts = dataPackagePrimaryKey.filter(header => !includes(allConceptsIds, header));

        let issue = null;

        if (!isEmpty(nonConcepts)) {
          issue = new Issue(DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY)
            .setPath(resolve(directoryDescriptor.dir, resource.path))
            .setData({nonConcepts});
        }

        return issue;
      })
    )
  ))
};
