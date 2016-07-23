'use strict';

const alphaVersion = require('../../src/alpha/version');
const gulp = require('gulp');
const justReplace = require('gulp-just-replace');

gulp.task('replace:versionAlpha', () => {
    return gulp
        .src('bin/alpha/plugCubed.src.js')
        .pipe(justReplace([{
            search: /VERSION\.BUILD/g,
            replacement: alphaVersion.build
        }, {
            search: /VERSION\.MAJOR/g,
            replacement: alphaVersion.major
        }, {
            search: /VERSION\.MINOR/g,
            replacement: alphaVersion.minor
        }, {
            search: /VERSION\.PATCH/g,
            replacement: alphaVersion.patch
        }, {
            search: /VERSION\.PRERELEASE/g,
            replacement: 'alpha'
        }]))
        .pipe(gulp.dest('bin/alpha'));
});
