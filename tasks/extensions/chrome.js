'use strict';

const gulp = require('gulp');
const zip = require('gulp-zip');

gulp.task('extensions:chrome', () => {
    return gulp
        .src('./extensions/Chrome/**')
        .pipe(zip('chrome.zip'))
        .pipe(gulp.dest('./extensions/'));
});
