'use strict';

const gulp = require('gulp');
const justReplace = require('gulp-just-replace');
const rename = require('gulp-rename');
const releaseVersion = require('../../src/release/version.js');

gulp.task('replace:extensionFirefox', () => {
    return gulp
        .src('extensions/shared/package.src.json')
        .pipe(justReplace([{
            search: /VERSION\.MAJOR\.VERSION\.MINOR\.VERSION\.PATCH-VERSION\.BUILD/g,
            replacement: `${releaseVersion.major}.${releaseVersion.minor}.${releaseVersion.patch}-${releaseVersion.build}`
        }]))
        .pipe(rename('package.json'))
        .pipe(gulp.dest('extensions/Firefox'));
});
