'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const gulpIf = require('gulp-if');

versions.forEach((version) => {
    if (version == null) return;

    gulp.task(`test:${version}`, () => {
        return gulp
            .src(`src/${version}/plugCubed/**/*.js`)
            .pipe(eslint({
                fix: true
            }))
            .pipe(eslint.format())
            .pipe(eslint.failAfterError())
            .pipe(gulpIf((file) => file.eslint && file.eslint.fixed, gulp.dest(`src/${version}/plugCubed/`)));
    });
});
