'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const gulpIf = require('gulp-if');

gulp.task('test:dev', () => {
    return gulp
        .src('src/dev/plugCubed/**/*.js')
        .pipe(eslint({
            fix: true
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(gulpIf((file) => file.eslint && file.eslint.fixed, gulp.dest('src/dev/plugCubed/')));
});
