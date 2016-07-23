'use strict';

// 3rd Party Modules
const releaseVersion = require('../../src/release/version');
const data = require('gulp-data');
const fs = require('graceful-fs');
const gulp = require('gulp');
const justReplace = require('gulp-just-replace');
const prettify = require('gulp-jsbeautifier');
const rename = require('gulp-rename');
const template = require('gulp-template');

gulp.task('template:release', () => {
    return gulp
        .src('src/shared/loader.template.js')
        .pipe(data((file, cb) => {
            fs.readFile('bin/release/plugCubed.src.js', 'utf8', (err, contents) => {
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
            replacement: `${releaseVersion.major}.${releaseVersion.minor}.${releaseVersion.patch}.${releaseVersion.build}+release`
        }]))
        .pipe(rename('plugCubed.js'))
        .pipe(prettify({
            config: './.jsbeautifyrc'
        }))
        .pipe(gulp.dest('bin/release/'))
        .pipe(gulp.dest('extensions/Chrome/'))
        .pipe(gulp.dest('extensions/Opera/'))
        .pipe(gulp.dest('extensions/Firefox/Data'));
});
