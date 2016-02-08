module.exports = function () {
  return {
    files: [
      'index.js',
      'common/*.js',
      'lib/**/*.js',
      { pattern: 'lib/*spec.js', ignore: true },
      { pattern: 'test/fixtures/**/*'},
      'utils/**/*.js'
    ],

    tests: [
      'test/*spec.js'
    ],
    testFramework: "mocha",
    delays: {
      edit: 500,
      run: 150
    },
    env: {
      type: 'node',
      runner: 'node',
      params: {
        env: 'NODE_ENV=test'
      }
    }
  };
};