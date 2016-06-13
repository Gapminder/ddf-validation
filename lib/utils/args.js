'use strict';

const _ = require('lodash');
const ROOT_PARAMETER_IS_REQUIRED = _.includes(process.argv, '--rules') ? 0 : 1;
const argv = require('yargs')
  .usage('Usage: $0 <root> [options]')
  .command('root', 'Root directory')
  .demand(ROOT_PARAMETER_IS_REQUIRED)
  .example('$0 ../ddf-example', 'validate DDF datasets for the root')
  .example('$0 ../ddf-example -i', 'generate ddf--index file')
  .example('$0 ../ddf-example -j', 'fix JSONs for this DDF dataset')
  .example('$0 ../ddf-example --rules', 'print information regarding supported rules')
  .example('$0 ../ddf-example --include-rules "INCORRECT_JSON_FIELD"', 'Validate only by INCORRECT_JSON_FIELD rule')
  .example('$0 ../ddf-example --exclude-tags "WARNING_TAG"', 'Get all kinds of issues except warnings')
  .describe('i', 'Generate index file')
  .describe('j', 'Fix wrong JSONs')
  .describe('rules', 'print information regarding supported rules')
  .describe('include-tags', 'Process only issues by selected tags')
  .describe('exclude-tags', 'Process all tags except selected')
  .describe('include-rules', 'Process only issues by selected rules')
  .describe('exclude-rules', 'Process all rules except selected')
  .argv;

exports.getDDFRootFolder = () => argv._[0] || process.cwd();
exports.getSettings = () => {
  const settings = {};

  settings.isUI = false;
  settings.isIndexGenerationMode = !!argv.i;
  settings.isJsonAutoCorrectionMode = !!argv.j;
  settings.isPrintRules = !!argv.rules;
  settings.includeTags = argv['include-tags'];
  settings.excludeTags = argv['exclude-tags'];
  settings.includeRules = argv['include-rules'];
  settings.excludeRules = argv['exclude-rules'];

  return settings;
};
