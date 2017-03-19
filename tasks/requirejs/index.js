'use strict';

// 3rd Party Modules
const fs = require('graceful-fs');
const gulp = require('gulp');
const rjs = require('requirejs');

versions.forEach((version) => {
    if (version == null) return;

    gulp.task(`requirejs:${version}`, (done) => {
        return rjs.optimize({
            name: 'plugCubed/Loader',
            baseUrl: `./src/${version}`,
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
                fs.writeFile(`bin/${version}/plugCubed.src.js`, text, done);
            }
        });
    });
});
