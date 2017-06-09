import { camelCase, head } from 'lodash';
import * as yargs from 'yargs';
import { getExcludedDirs } from '../data/shared';

declare var process: any;

const myName = 'validate-ddf';
const argv = yargs
  .usage(`Usage: ${myName} [root] [options]`)
  .command('root', 'DDF Root directory')
  .example(`${myName} ../ddf-example`, 'validate DDF datasets for the root')
  .example(`${myName} ../ddf-example -i`, 'generate datapackage.json file')
  .example(`${myName} ../ddf-example -i --translations`, 'update only "translations" section in datapackage.json')
  .example(`${myName} ../ddf-example -i --translations --content`, 'rewrite "translations", "resources" and "ddfSchema" sections in datapackage.json')
  .example(`${myName} ../ddf-example -j`, 'fix JSONs for this DDF dataset')
  .example(`${myName} --rules`, 'print information regarding supported rules')
  .example(`${myName} ../ddf-example --multithread`,
    'validate datapoints for `ddf-example` in separate threads')
  .example(`${myName} ../ddf-example --hidden`, 'allow hidden folders validation')
  .example(`${myName} ../ddf-example --include-rules "INCORRECT_JSON_FIELD"`,
    'Validate only by INCORRECT_JSON_FIELD rule')
  .example(`${myName} ../ddf-example --exclude-tags "WARNING_TAG"`,
    'Get all kinds of issues except warnings')
  .example(`${myName} ../ddf-example --exclude-dirs "etl,foo-dir"`,
    'validate "ddf-example" and its subdirectories except "etl" and "foo-dir"')
  .example(`${myName} ../ddf-example --exclude-dirs "'dir1 with spaces','dir2 with spaces'"`,
    'validate "ddf-example" and its subdirectories that contain spaces')
  .example(`${myName} ../ddf-example --exclude-dirs '"dir1 with spaces","dir2 with spaces"'`,
    'validate "ddf-example" and its subdirectories that contain spaces: case 2')
  .describe('i', 'Generate datapackage.json file')
  .describe('translations', 'Rewrite "translations" section in existing datapackage.json')
  .describe('content', 'Rewrite "resources" and "ddfSchema" sections in existing datapackage.json')
  .describe('j', 'Fix wrong JSONs')
  .describe('rules', 'print information regarding supported rules')
  .describe('multithread', 'validate datapoints in separate threads')
  .describe('datapointless', 'forget about datapoint validation')
  .describe('hidden', 'allow hidden folders validation')
  .describe('include-tags', 'Process only issues by selected tags')
  .describe('exclude-tags', 'Process all tags except selected')
  .describe('include-rules', 'Process only issues by selected rules')
  .describe('exclude-rules', 'Process all rules except selected')
  .describe('exclude-dirs',
    'Process all directories except selected. Directories should be separated via "," character')
  .argv;

export const getDDFRootFolder = () => head(argv._) || process.cwd();
export const getSettings = () => {
  const settings: any = {};
  const options = ['include-tags', 'exclude-tags', 'include-rules', 'exclude-rules', 'exclude-dirs'];
  const setMiscSettings = () => {
    settings.isUI = false;
    settings.isDataPackageGenerationMode = !!argv.i;
    settings.isJsonAutoCorrectionMode = !!argv.j;
    settings.versionShouldBePrinted = !!argv.v;
    settings.datapointlessMode = !!argv.datapointless;
    settings.updateDataPackageTranslations = !!argv.translations;
    settings.updateDataPackageContent = !!argv.content;
    settings.isPrintRules = !!argv.rules;
    settings.isCheckHidden = !!argv.hidden;
    settings.isMultithread = !!argv.multithread;
  };

  setMiscSettings();

  options.forEach(option => {
    settings[camelCase(option)] = argv[option];
  });

  settings.excludeDirs = getExcludedDirs(settings);

  return settings;
};
