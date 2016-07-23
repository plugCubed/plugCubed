'use strict';

const lint = require('mocha-eslint');

const paths = [
    'src/alpha/plugCubed/**/*.js'
];

const options = {};

lint(paths, options);
