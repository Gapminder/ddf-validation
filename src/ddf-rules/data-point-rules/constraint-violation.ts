import { compact, flattenDeep, includes } from 'lodash';
import { DATA_POINT_CONSTRAINT_VIOLATION } from '../registry';
import { cacheFor, IConstraintDescriptor, resetCache } from './shared';
import { Issue } from '../issue';

export const rule = {
  isDataPoint: true,
  resetStorage: () => {
    resetCache();
  },
  recordRule: dataPointDescriptor => {
    const constraints: IConstraintDescriptor[] = cacheFor.constraintsByFileDescriptor(dataPointDescriptor);
    const constraintViolation = (constraint: IConstraintDescriptor) => {
      return !includes(constraint.constraints, dataPointDescriptor.record[constraint.fieldName]);
    };

    return compact(flattenDeep(
      constraints.filter(constraintViolation).map((constraint: IConstraintDescriptor) =>
        new Issue(DATA_POINT_CONSTRAINT_VIOLATION).setPath(constraint.fullPath).setData({
          constraints: constraint.constraints,
          fieldName: constraint.fieldName,
          fieldValue: dataPointDescriptor.record[constraint.fieldName],
          line: dataPointDescriptor.line
        }))
    ));
  }
};
