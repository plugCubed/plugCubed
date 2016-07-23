'use strict';

const devVersion = require('../../src/dev/version');
const gulp = require('gulp');
const justReplace = require('gulp-just-replace');

gulp.task('replace:versionDev', () => {
    return gulp
        .src('bin/dev/plugCubed.src.js')
        .pipe(justReplace([{
            search: /VERSION\.BUILD/g,
            replacement: devVersion.build
        }, {
            search: /VERSION\.MAJOR/g,
            replacement: devVersion.major
        }, {
            search: /VERSION\.MINOR/g,
            replacement: devVersion.minor
        }, {
            search: /VERSION\.PATCH/g,
            replacement: devVersion.patch
        }, {
            search: /VERSION\.PRERELEASE/g,
            replacement: 'dev'
        }]))
        .pipe(gulp.dest('bin/dev'));
});
