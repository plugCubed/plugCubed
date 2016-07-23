'use strict';

const lint = require('mocha-eslint');

const paths = [
    'src/dev/plugCubed/**/*.js'
];

const options = {
    alwaysWarn: false
};

lint(paths, options);
