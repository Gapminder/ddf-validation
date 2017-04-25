import { DataPackage } from '../data/data-package';
import { DdfDataSet } from '../ddf-definitions/ddf-data-set';
import { DdfSchemaStory } from "./ddf-schema-story";

export const getDdfSchema = (dataPackageDescriptor: DataPackage, onDdfSchemaReady: Function) => {
  const ddfDataSet = new DdfDataSet(dataPackageDescriptor.rootFolder, {});

  ddfDataSet.load(() => {
    const ddfSchemaStory = new DdfSchemaStory(ddfDataSet, dataPackageDescriptor);

    ddfSchemaStory.getDomainHash().getEntitiesDataByFiles().fillEntitiesValueHash().getDataPointsResources().waitForDataPointSchema(() => {
      const ddfSchema = ddfSchemaStory.fillEntityResourceHash().getEntitiesSchema().getConceptsFieldsHash().getConceptsSchema().resume();

      onDdfSchemaReady(ddfSchema);
    });
  });
};
