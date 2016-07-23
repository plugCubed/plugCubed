'use strict';

const gulp = require('gulp');
const justReplace = require('gulp-just-replace');
const releaseVersion = require('../../src/release/version');

gulp.task('replace:versionRelease', () => {
    return gulp
        .src('bin/release/plugCubed.src.js')
        .pipe(justReplace([{
            search: /VERSION\.BUILD/g,
            replacement: releaseVersion.build
        }, {
            search: /VERSION\.MAJOR/g,
            replacement: releaseVersion.major
        }, {
            search: /VERSION\.MINOR/g,
            replacement: releaseVersion.minor
        }, {
            search: /VERSION\.PATCH/g,
            replacement: releaseVersion.patch
        }, {
            search: /VERSION\.PRERELEASE/g,
            replacement: ''
        }]))
        .pipe(gulp.dest('bin/release'));
});
