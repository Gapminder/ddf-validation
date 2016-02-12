'use strict';

const argv = require('yargs')
  .usage('Usage: $0 <root> [options]')
  .command('root', 'Root directory')
  .demand(1)
  .example('$0 ../ddf-example -d year', 'check "ddf-example" directory with data points checking')
  .describe('d', 'Dimension for gaps checking in data points')
  .argv;

exports.getDDFRootFolder = () => argv._[0] || process.cwd();
exports.getSettings = () => {
  let settings = {};
  settings.gapsSupportDimensions = typeof argv.d === 'string' ? [argv.d] : argv.d;
  return settings;
};
