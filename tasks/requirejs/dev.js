'use strict';

// 3rd Party Modules
const fs = require('graceful-fs');
const gulp = require('gulp');
const rjs = require('requirejs');


gulp.task('requirejs:dev', (done) => {

    return rjs.optimize({
        name: 'plugCubed/Loader',
        baseUrl: './src/dev',
        optimize: 'none',
        keepBuildDir: false,
        removeCombined: false,
        useStrict: true,
        findNestedDependencies: true,
        paths: {
            backbone: 'empty:',
            jquery: 'empty:',
            underscore: 'empty:',
            'lang/Lang': 'empty:'
        },
        out(text) {
            fs.writeFile('bin/dev/plugCubed.src.js', text, done);
        }
    });
});

