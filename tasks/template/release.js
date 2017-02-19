'use strict';

const releaseVersion = require('../../src/release/version');
const fs = require('graceful-fs');
const gulp = require('gulp');
const justReplace = require('gulp-just-replace');
const rename = require('gulp-rename');
const exec = require('gulp-exec');

gulp.task('template:release', () => {
    const contents = fs.readFileSync('bin/release/plugCubed.src.js', 'utf8');

    return gulp
        .src('src/shared/loader.template.js')
        .pipe(justReplace([{
            search: /\/\/ CODE_TO_REPLACE/,
            replacement: contents
        }, {
            search: /%YEAR%/g,
            replacement: new Date().getFullYear()
        }, {
            search: /VERSION\.MAJOR\.VERSION\.MINOR\.VERSION\.PATCH-VERSION\.BUILD\+VERSION\.PRERELEASE/g,
            replacement: `${releaseVersion.major}.${releaseVersion.minor}.${releaseVersion.patch}.${releaseVersion.build}+release`
        }]))
        .pipe(rename('plugCubed.js'))
        .pipe(exec('eslint --fix <%= file.path %>'))
        .pipe(gulp.dest('bin/release/'))
        .pipe(gulp.dest('extensions/Chrome/'))
        .pipe(gulp.dest('extensions/Opera/'))
        .pipe(gulp.dest('extensions/Firefox/Data'));
});
