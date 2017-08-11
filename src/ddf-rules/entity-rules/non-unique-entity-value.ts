import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { SearchUniqueEntitiesStory } from './stories/duplicated-entities';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => new SearchUniqueEntitiesStory(ddfDataSet).fillServiceData()
    .collectFieldDescriptors().collectValueCounters().collectValueDuplicationDescriptors().countDuplicationsByEntitySets().result()
};
