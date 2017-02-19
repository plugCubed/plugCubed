'use strict';

const alphaVersion = require('../../src/alpha/version');
const data = require('gulp-data');
const fs = require('graceful-fs');
const gulp = require('gulp');
const justReplace = require('gulp-just-replace');
const rename = require('gulp-rename');
const template = require('gulp-template');
const eslint = require('gulp-eslint');

gulp.task('template:alpha', () => {
    return gulp
        .src('src/shared/loader.template.js')
        .pipe(data((file, cb) => {
            fs.readFile('bin/alpha/plugCubed.src.js', 'utf8', (err, contents) => {
                if (err) {
                    return cb(err);
                }
                cb(null, {
                    code: contents
                });
            });
        }))
        .pipe(template())
        .pipe(justReplace([{
            search: /%YEAR%/g,
            replacement: new Date().getFullYear()
        }, {
            search: /VERSION\.MAJOR\.VERSION\.MINOR\.VERSION\.PATCH-VERSION\.BUILD\+VERSION\.PRERELEASE/g,
            replacement: `${alphaVersion.major}.${alphaVersion.minor}.${alphaVersion.patch}.${alphaVersion.build}+alpha`
        }]))
        .pipe(rename('plugCubed.js'))
        .pipe(gulp.dest('bin/alpha/'));
});
