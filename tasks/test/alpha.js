'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const gulpIf = require('gulp-if');

gulp.task('test:alpha', () => {
    return gulp
        .src('src/alpha/plugCubed/**/*.js')
        .pipe(eslint({
            fix: true
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(gulpIf((file) => file.eslint && file.eslint.fixed, gulp.dest('src/alpha/plugCubed/')));
});
