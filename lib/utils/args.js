'use strict';

const _ = require('lodash');
const ROOT_PARAMETER_IS_REQUIRED = _.includes(process.argv, '--rules') ? 0 : 1;
const myName = 'validate-ddf';
const argv = require('yargs')
  .usage(`Usage: ${myName} <root> [options]`)
  .command('root', 'DDF Root directory')
  .demand(ROOT_PARAMETER_IS_REQUIRED)
  .example(`${myName} ../ddf-example`, 'validate DDF datasets for the root')
  .example(`${myName} ../ddf-example -i`, 'generate ddf--index file')
  .example(`${myName} ../ddf-example -j`, 'fix JSONs for this DDF dataset')
  .example(`${myName} ../ddf-example --rules`, 'print information regarding supported rules')
  .example(`${myName} ../ddf-example --include-rules "INCORRECT_JSON_FIELD"`,
    'Validate only by INCORRECT_JSON_FIELD rule')
  .example(`${myName} ../ddf-example --exclude-tags "WARNING_TAG"`, 'Get all kinds of issues except warnings')
  .describe('i', 'Generate index file')
  .describe('j', 'Fix wrong JSONs')
  .describe('rules', 'print information regarding supported rules')
  .describe('include-tags', 'Process only issues by selected tags')
  .describe('exclude-tags', 'Process all tags except selected')
  .describe('include-rules', 'Process only issues by selected rules')
  .describe('exclude-rules', 'Process all rules except selected')
  .describe('exclude-dirs', 'Process all directories except selected')
  .argv;

exports.getDDFRootFolder = () => argv._[0] || process.cwd();
exports.getSettings = () => {
  const settings = {};
  const options = ['include-tags', 'exclude-tags', 'include-rules', 'exclude-rules', 'exclude-dirs'];

  settings.isUI = false;
  settings.isIndexGenerationMode = !!argv.i;
  settings.isJsonAutoCorrectionMode = !!argv.j;
  settings.isPrintRules = !!argv.rules;
  options.forEach(option => {
    settings[_.camelCase(option)] = argv[option];
  });

  return settings;
};
