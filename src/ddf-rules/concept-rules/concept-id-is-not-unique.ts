import {transform, countBy, isEmpty} from 'lodash';
import {CONCEPT_ID_IS_NOT_UNIQUE} from '../registry';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const concept = ddfDataSet.getConcept();
    const paths = concept.fileDescriptors.map(fileDescriptor => fileDescriptor.fullPath);
    let result = null;

    const conceptsIds = concept
      .getAllData()
      .map(conceptRecord => conceptRecord.concept);
    const nonUniqueConceptIds = transform(
      countBy(conceptsIds), (_result, count, value) => {
        if (count > 1) {
          _result.push(value);
        }
      },
      []
    );

    if (!isEmpty(nonUniqueConceptIds)) {
      result = new Issue(CONCEPT_ID_IS_NOT_UNIQUE)
        .setPath(paths)
        .setData(nonUniqueConceptIds);
    }

    return result;
  }
};
