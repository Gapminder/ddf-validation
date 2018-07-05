import * as path from 'path';
import { head, keys } from 'lodash';
import { DUPLICATED_SYNONYM_KEY } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';

const getPrimaryKeyByFile = (ddfDataSet: DdfDataSet, file: string): string[] => <string[]>head(
  ddfDataSet.getDataPackageResources()
    .filter(resource => resource.path === file)
    .map(resource => resource.schema.primaryKey)
);

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const issues = [];
    const synonymsByFile = ddfDataSet.getSynonym().getDataByFiles();
    const duplicationsHash = new Map<string, number>();
    const filesHash = new Map<string, string>();
    const pkHash = new Map<string, string[]>();

    for (const synonymsFile of keys(synonymsByFile)) {
      const primaryKey = getPrimaryKeyByFile(ddfDataSet, path.relative(ddfDataSet.rootPath, synonymsFile)).sort();

      for (const record of synonymsByFile[synonymsFile]) {
        let pkData = '';

        for (const pkPart of primaryKey) {
          pkData += `${record[pkPart]}#`;
        }

        if (!duplicationsHash.has(pkData)) {
          duplicationsHash.set(pkData, 1);
          filesHash.set(pkData, synonymsFile);
          pkHash.set(pkData, pkData.substring(0, pkData.length - 1).split('#'));
        } else {
          duplicationsHash.set(pkData, duplicationsHash.get(pkData) + 1);
        }
      }
    }


    for (const pkData of duplicationsHash.keys()) {
      if (duplicationsHash.get(pkData) > 1) {
        issues.push(new Issue(DUPLICATED_SYNONYM_KEY).setPath(filesHash.get(pkData)).setData(pkHash.get(pkData)));
      }
    }

    return issues;
  }
};
