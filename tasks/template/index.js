'use strict';

const data = require('gulp-data');
const fs = require('graceful-fs');
const gulp = require('gulp');
const path = require('path');
const justReplace = require('gulp-just-replace');
const rename = require('gulp-rename');
const template = require('gulp-template');

versions.forEach((version) => {
    if (version == null) return;

    gulp.task(`template:${version}`, () => {
        const versionFile = require(path.resolve('src', version, 'version'));

        return gulp
            .src('src/shared/loader.template.js')
            .pipe(data((file, cb) => {
                fs.readFile(`bin/${version}/plugCubed.src.js`, 'utf8', (err, contents) => {
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
                search: /VERSION\.MAJOR/g,
                replacement: versionFile.major
            }, {
                search: /VERSION\.MINOR/g,
                replacement: versionFile.minor
            }, {
                search: /VERSION\.PATCH/g,
                replacement: versionFile.patch
            }, {
                search: /VERSION\.PRERELEASE/g,
                replacement: version
            }, {
                search: /VERSION\.BUILD/g,
                replacement: versionFile.build
            }]))
            .pipe(rename('plugCubed.js'))
            .pipe(gulp.dest(`bin/${version}/`));
    });

});
