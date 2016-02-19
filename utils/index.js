const args = require('./args');
const settings = args.getSettings();

exports.settings = settings;
exports.ddfRootFolder = args.getDDFRootFolder();
exports.getLogger = () => require('./logger')(settings);
exports.getConsoleLogger = () => require('./logger')({isUI: false});
