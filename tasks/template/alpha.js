'use strict';

const alphaVersion = require('../../src/alpha/version');
const fs = require('graceful-fs');
const gulp = require('gulp');
const justReplace = require('gulp-just-replace');
const rename = require('gulp-rename');
const exec = require('gulp-exec');

gulp.task('template:alpha', () => {
    const contents = fs.readFileSync('bin/alpha/plugCubed.src.js', 'utf8');

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
            replacement: `${alphaVersion.major}.${alphaVersion.minor}.${alphaVersion.patch}.${alphaVersion.build}+alpha`
        }]))
        .pipe(rename('plugCubed.js'))
        .pipe(exec('eslint --fix <%= file.path %>'))
        .pipe(gulp.dest('bin/alpha/'));
});
