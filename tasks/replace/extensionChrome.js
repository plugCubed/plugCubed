'use strict';

const gulp = require('gulp');
const justReplace = require('gulp-just-replace');
const rename = require('gulp-rename');
const releaseVersion = require('../../src/release/version.js');

gulp.task('replace:extensionChrome', () => {
    return gulp
        .src('extensions/shared/manifest.src.json')
        .pipe(justReplace([{
            search: /VERSION\.MAJOR\.VERSION\.MINOR\.VERSION\.PATCH\.VERSION\.BUILD/g,
            replacement: `${releaseVersion.major}.${releaseVersion.minor}.${releaseVersion.patch}.${releaseVersion.build}`
        }]))
        .pipe(rename('manifest.json'))
        .pipe(gulp.dest('extensions/Chrome'))
        .pipe(gulp.dest('extensions/Opera'));
});
