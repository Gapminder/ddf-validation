'use strict';

const _ = require('lodash');
// const ROOT_PARAMETER_IS_REQUIRED = _.includes(process.argv, '--rules') ? 0 : 1;
const myName = 'validate-ddf';
const argv = require('yargs')
  .usage(`Usage: ${myName} [root] [options]`)
  .command('root', 'DDF Root directory')
  // .demand(ROOT_PARAMETER_IS_REQUIRED)
  .example(`${myName} ../ddf-example`, 'validate DDF datasets for the root')
  .example(`${myName} ../ddf-example -i`, 'generate ddf--index file')
  .example(`${myName} ../ddf-example -j`, 'fix JSONs for this DDF dataset')
  .example(`${myName} --rules`, 'print information regarding supported rules')
  .example(`${myName} ../ddf-example --indexless`, 'forget about ddf--index.csv and validate')
  .example(`${myName} ../ddf-example --multidir`,
    'validate `ddf-example` and all subdirectories under "ddf-example"')
  .example(`${myName} ../ddf-example --hidden`, 'allow hidden folders validation')
  .example(`${myName} ../ddf-example --include-rules "INCORRECT_JSON_FIELD"`,
    'Validate only by INCORRECT_JSON_FIELD rule')
  .example(`${myName} ../ddf-example --exclude-tags "WARNING_TAG"`,
    'Get all kinds of issues except warnings')
  .example(`${myName} ../ddf-example --exclude-dirs "etl foo-dir"`,
    'validate "ddf-example" and its subdirectories except "etl" and "foo-dir"')
  .describe('i', 'Generate index file')
  .describe('j', 'Fix wrong JSONs')
  .describe('rules', 'print information regarding supported rules')
  .describe('indexless', 'forget about ddf--index.csv and validate')
  .describe('multidir', 'validate all subdirectories')
  .describe('datapointless', 'forget about datapoint validation')
  .describe('hidden', 'allow hidden folders validation')
  .describe('include-tags', 'Process only issues by selected tags')
  .describe('exclude-tags', 'Process all tags except selected')
  .describe('include-rules', 'Process only issues by selected rules')
  .describe('exclude-rules', 'Process all rules except selected')
  .describe('exclude-dirs',
    'Process all directories except selected. Truly only for `--multidir` mode')
  .argv;

exports.getDDFRootFolder = () => argv._[0] || process.cwd();
exports.getSettings = () => {
  const settings = {};
  const options = ['include-tags', 'exclude-tags', 'include-rules', 'exclude-rules', 'exclude-dirs'];
  const setMiscSettings = () => {
    settings.isUI = false;
    settings.isIndexGenerationMode = !!argv.i;
    settings.isJsonAutoCorrectionMode = !!argv.j;
    settings.indexlessMode = !!argv.indexless;
    settings.multiDirMode = !!argv.multidir;
    settings.datapointlessMode = !!argv.datapointless;
    settings.isPrintRules = !!argv.rules;
    settings.isCheckHidden = !!argv.hidden;
  };

  setMiscSettings();

  options.forEach(option => {
    settings[_.camelCase(option)] = argv[option];
  });

  settings.excludeDirs = getExcludedDirs(settings);

  return settings;
};

function getExcludedDirs(settings) {
  if (settings && settings.excludeDirs) {
    return _.split(settings.excludeDirs, ',');
  }

  return [];
}
