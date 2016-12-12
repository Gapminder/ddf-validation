import {getSettings, getDDFRootFolder} from './args';
import {getLogger} from './logger';

export const settings: any = getSettings();
export const logger: any = getLogger();
export const ddfRootFolder = getDDFRootFolder();
