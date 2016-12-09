import {EMPTY_CONCEPT_ID} from '../registry';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => ddfDataSet
    .getConcept()
    .getAllData()
    .filter(conceptRecord => !conceptRecord.concept)
    .map(conceptRecordWithEmptyId =>
      new Issue(EMPTY_CONCEPT_ID)
        .setPath(conceptRecordWithEmptyId.$$source)
        .setData({line: conceptRecordWithEmptyId.$$lineNumber})
    )
};
