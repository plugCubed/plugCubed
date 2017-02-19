'use strict';

const gulp = require('gulp');
const zip = require('gulp-zip');

gulp.task('extensions:opera', () => {
    return gulp
        .src('./extensions/opera/**')
        .pipe(zip('opera.zip'))
        .pipe(gulp.dest('./extensions/'))
});
