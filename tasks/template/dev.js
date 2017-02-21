'use strict';

const devVersion = require('../../src/dev/version');
const data = require('gulp-data');
const fs = require('graceful-fs');
const gulp = require('gulp');
const justReplace = require('gulp-just-replace');
const rename = require('gulp-rename');
const template = require('gulp-template');

gulp.task('template:dev', () => {
    return gulp
        .src('src/shared/loader.template.js')
        .pipe(data((file, cb) => {
            fs.readFile('bin/dev/plugCubed.src.js', 'utf8', (err, contents) => {
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
            replacement: `${devVersion.major}.${devVersion.minor}.${devVersion.patch}.${devVersion.build}+dev`
        }]))
        .pipe(rename('plugCubed.js'))
        .pipe(gulp.dest('bin/dev/'));
});
