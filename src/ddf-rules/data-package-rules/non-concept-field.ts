import { compact, flattenDeep, includes, isEmpty } from 'lodash';
import { resolve } from 'path';
import { DATAPACKAGE_NON_CONCEPT_FIELD } from '../registry';
import { PREDEFINED_CONCEPTS } from '../../ddf-definitions/constants';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => compact(flattenDeep(
    ddfDataSet.ddfRoot.directoryDescriptors.map(directoryDescriptor =>
      directoryDescriptor.dataPackage.getResources().map(resource => {
        const dataPackageFields = resource.schema.fields.map(field => field.name.replace(/^is--/, ''));
        const allConceptsIds = ddfDataSet.getConcept().getIds().concat(PREDEFINED_CONCEPTS);
        const nonConcepts = dataPackageFields.filter(header => !includes(allConceptsIds, header));

        let issue = null;

        if (isEmpty(dataPackageFields)) {
          issue = new Issue(DATAPACKAGE_NON_CONCEPT_FIELD)
            .setPath(resolve(directoryDescriptor.dir, resource.path))
            .setData({reason: 'fields section in datapackage is empty'});
        }

        if (!isEmpty(nonConcepts) && !issue) {
          issue = new Issue(DATAPACKAGE_NON_CONCEPT_FIELD)
            .setPath(resolve(directoryDescriptor.dir, resource.path))
            .setData({nonConcepts});
        }

        return issue;
      })
    )
  ))
};
