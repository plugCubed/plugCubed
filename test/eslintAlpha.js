var lint = require('mocha-eslint');

var paths = [
    'src/alpha/plugCubed/**/*.js'
];

var options = {};

lint(paths, options);
