var lint = require('mocha-eslint');

var paths = [
    'src/release/plugCubed/**/*.js'
];

var options = {};

lint(paths, options);
