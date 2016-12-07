import {getSettings, getDDFRootFolder} from './args';
import {getLogger} from './logger';

export const settings = getSettings();
export const logger = getLogger();
export const ddfRootFolder = getDDFRootFolder();
